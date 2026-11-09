import { NextRequest, NextResponse } from "next/server";
import tls from "tls";
import { createOtpToken } from "@/lib/auth";

async function sendGmailSmtp({
  gmailUser,
  gmailAppPassword,
  toEmail,
  otpCode,
}: {
  gmailUser: string;
  gmailAppPassword: string;
  toEmail: string;
  otpCode: string;
}): Promise<{ sent: boolean; error?: string }> {
  return new Promise((resolve) => {
    const cleanPass = gmailAppPassword.replace(/\s+/g, "");
    const socket = tls.connect(
      {
        host: "smtp.gmail.com",
        port: 465,
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
      },
      () => {
        // Connected
      }
    );

    let step = 0;
    let buffer = "";

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ sent: false, error: "SMTP connection timeout" });
    }, 8000);

    const sendLine = (line: string) => {
      socket.write(line + "\r\n");
    };

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (!buffer.endsWith("\r\n")) return;
      const responseText = buffer.trim();
      buffer = "";

      const code = parseInt(responseText.slice(0, 3), 10);
      if (code >= 400) {
        clearTimeout(timeout);
        socket.end();
        resolve({ sent: false, error: responseText });
        return;
      }

      if (step === 0 && code === 220) {
        step = 1;
        sendLine("EHLO toktrend.onyou.cyou");
      } else if (step === 1 && code === 250) {
        step = 2;
        sendLine("AUTH LOGIN");
      } else if (step === 2 && code === 334) {
        step = 3;
        sendLine(Buffer.from(gmailUser, "utf8").toString("base64"));
      } else if (step === 3 && code === 334) {
        step = 4;
        sendLine(Buffer.from(cleanPass, "utf8").toString("base64"));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine(`MAIL FROM:<${gmailUser}>`);
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine(`RCPT TO:<${toEmail}>`);
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine("DATA");
      } else if (step === 7 && code === 354) {
        step = 8;
        const subject = `Kode Verifikasi Akun TokTrend Flow: ${otpCode}`;
        const htmlBody = [
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f172a;color:#f8fafc;border-radius:16px;">`,
          `<h2 style="margin:0 0 12px;color:#10b981;">TokTrend Flow</h2>`,
          `<p style="font-size:14px;color:#cbd5e1;line-height:1.6;">Halo, berikut adalah kode verifikasi 6 digit untuk pendaftaran akun Anda:</p>`,
          `<div style="margin:20px 0;padding:16px;background:#1e293b;border:1px solid #334155;border-radius:12px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#34d399;">${otpCode}</div>`,
          `<p style="font-size:12px;color:#94a3b8;">Kode ini berlaku selama 10 menit. Jangan bagikan kode ini kepada siapa pun.</p>`,
          `</div>`,
        ].join("");

        const messageData = [
          `From: "TokTrend Flow" <${gmailUser}>`,
          `To: <${toEmail}>`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          htmlBody,
          `.`,
        ].join("\r\n");

        sendLine(messageData);
      } else if (step === 8 && code === 250) {
        step = 9;
        clearTimeout(timeout);
        sendLine("QUIT");
        socket.end();
        resolve({ sent: true });
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ sent: false, error: err.message });
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();
    const customSmtpUser = (
      body?.smtpUser ||
      process.env.GMAIL_USER ||
      ""
    ).trim();
    const customSmtpPass = (
      body?.smtpPass ||
      process.env.GMAIL_APP_PASSWORD ||
      ""
    ).trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Masukkan alamat email Gmail yang valid terlebih dahulu." },
        { status: 400 }
      );
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@toktrend.id")) {
      return NextResponse.json(
        {
          error:
            "Pendaftaran wajib menggunakan alamat email Google (@gmail.com).",
        },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const otpToken = createOtpToken(email, otpCode);

    let sentViaSmtp = false;
    let smtpNotice = "";

    if (customSmtpUser && customSmtpPass) {
      const smtpResult = await sendGmailSmtp({
        gmailUser: customSmtpUser,
        gmailAppPassword: customSmtpPass,
        toEmail: email,
        otpCode,
      });
      sentViaSmtp = smtpResult.sent;
      if (!smtpResult.sent) {
        smtpNotice =
          "Kredensial SMTP Gmail belum sesuai, menampilkan kode verifikasi instan.";
      }
    }

    const response = NextResponse.json({
      success: true,
      email,
      otpToken,
      sentViaSmtp,
      // When SMTP App Password isn't configured yet, return previewOtp so user/admin can still verify & test immediately
      previewOtp: sentViaSmtp ? undefined : otpCode,
      message: sentViaSmtp
        ? `Kode verifikasi 6 digit telah dikirim ke Gmail ${email}. Silakan cek Inbox atau folder Spam Anda.`
        : smtpNotice ||
          `Kode verifikasi untuk ${email} berhasil dibuat. (Mode Instan: ${otpCode})`,
    });

    response.cookies.set("toktrend_otp_token", otpToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json(
      { error: "Gagal mengirim kode verifikasi email." },
      { status: 500 }
    );
  }
}
