"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Gmail OTP Verification State
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpInfoMessage, setOtpInfoMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [otpCooldown]);

  const handleRequestGmailOtp = async () => {
    setError(null);
    setOtpInfoMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.endsWith("@gmail.com")) {
      setError(
        "Pendaftaran akun wajib menggunakan alamat email Google (@gmail.com)."
      );
      return;
    }

    setOtpSending(true);
    try {
      let smtpUser = "";
      let smtpPass = "";
      try {
        const savedCfg = localStorage.getItem("toktrend_admin_site_config_v2");
        if (savedCfg) {
          const parsed = JSON.parse(savedCfg);
          smtpUser = parsed.smtpGmailUser || "";
          smtpPass = parsed.smtpGmailAppPassword || "";
        }
      } catch {}

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, smtpUser, smtpPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengirim kode verifikasi ke Gmail.");
      } else {
        if (data.otpToken) setOtpToken(data.otpToken);
        setOtpCooldown(60);
        setOtpInfoMessage(
          data.message || `Kode verifikasi telah dikirim ke ${cleanEmail}.`
        );
      }
    } catch {
      setError("Gagal menghubungi server verifikasi email.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === "register") {
      if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
        setError("Pendaftaran wajib menggunakan alamat email @gmail.com.");
        return;
      }
      if (!otpCode.trim()) {
        setError(
          "Masukkan 6 digit kode verifikasi yang dikirim ke Gmail Anda terlebih dahulu."
        );
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        authMode === "login"
          ? { email, password }
          : { name, email, password, otpCode: otpCode.trim(), otpToken };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Autentikasi gagal. Periksa kembali data Anda.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Gagal menghubungi server autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "creator@toktrend.id",
          password: "password123",
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Gagal masuk akun demo.");
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07090E] text-[#F3F4F6] flex flex-col justify-between overflow-hidden">
      {/* Subtle Ambient Background Glows & Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[110px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      {/* Clean Top Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0B0E17]/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400 transition">
              <svg
                width="18"
                height="15"
                viewBox="0 0 34 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 3.5L14.5 13L2 22.5V3.5Z"
                  fill="#10B981"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle
                  cx="23.5"
                  cy="13"
                  r="8.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">
              TokTrend <span className="text-emerald-400">Flow</span>
            </span>
          </Link>

          <Link
            href="/"
            className="px-4 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-xs font-medium transition"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-[#0D1017]/90 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Left Visual Showcase (TikTok Analytics & AI Video Studio Theme) */}
          <div className="lg:col-span-6 relative bg-gradient-to-br from-[#0F1622] via-[#0B0E17] to-[#091516] p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
            {/* Decorative Radial Glow */}
            <div className="pointer-events-none absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                TikTok Shop Intelligence &amp; AI Studio
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                Riset Produk Winning &amp; Buat Video Affiliate Lebih Terukur
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pantau pergerakan GMV, temukan produk dengan komisi terbaik, dan susun skrip serta prompt visual AI siap pakai dalam satu dashboard.
              </p>
            </div>

            {/* Interactive-looking Analytics & AI Prompt Preview Vector Card */}
            <div className="relative z-10 my-6 space-y-3">
              {/* Mock Product Trend Card */}
              <div className="p-4 rounded-2xl bg-[#121723]/90 border border-slate-800/90 shadow-lg space-y-3 transition-transform duration-500 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Trending #1 • Skincare &amp; Beauty</div>
                      <div className="text-[11px] text-slate-400">Lonjakan Penjualan 7 Hari Terakhir</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-xs font-bold">
                    +184.5%
                  </span>
                </div>

                {/* Animated SVG Trend Chart */}
                <div className="pt-1">
                  <svg viewBox="0 0 280 56" className="w-full h-14 overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 46 Q 35 42, 65 30 T 135 24 T 205 12 T 280 4 L 280 56 L 0 56 Z"
                      fill="url(#chartGrad)"
                    />
                    <path
                      d="M0 46 Q 35 42, 65 30 T 135 24 T 205 12 T 280 4"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="205" cy="12" r="3.5" fill="#10B981" />
                    <circle cx="280" cy="4" r="4.5" fill="#34D399" className="animate-ping" />
                    <circle cx="280" cy="4" r="4" fill="#10B981" />
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Estimasi GMV</div>
                    <div className="text-xs font-bold text-white">Rp 412 Jt</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Komisi Kreator</div>
                    <div className="text-xs font-bold text-emerald-400">15% ( Tinggi )</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Skor AI</div>
                    <div className="text-xs font-bold text-cyan-400">94 / 100</div>
                  </div>
                </div>
              </div>

              {/* Mock AI Video Prompt Studio Badge */}
              <div className="p-3.5 rounded-2xl bg-[#121723]/75 border border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">AI Video Prompt &amp; Hook Generator</div>
                    <div className="text-[11px] text-slate-400">Siap ekspor ke Runway, Kling &amp; CapCut</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
                  Auto-Script
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Dipercaya Kreator &amp; Seller Affiliate</span>
              <span className="text-emerald-400 font-medium">Data Real-Time</span>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {authMode === "login"
                  ? "Masuk ke Akun Anda"
                  : "Buat Akun Baru (Verifikasi Gmail)"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === "login"
                  ? "Masuk untuk mengakses analitik produk dan studio prompt AI."
                  : "Gunakan alamat Gmail aktif untuk menerima kode verifikasi 6 digit."}
              </p>
            </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError(null);
                setOtpInfoMessage(null);
              }}
              className={`py-2 rounded-lg transition ${
                authMode === "login"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setError(null);
                setOtpInfoMessage(null);
              }}
              className={`py-2 rounded-lg transition ${
                authMode === "register"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Daftar Akun (Gmail)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {otpInfoMessage && authMode === "register" && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
              {otpInfoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {authMode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nama Lengkap / Nama Kreator
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rina Affiliate"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {authMode === "register"
                  ? "Alamat Email Gmail (@gmail.com)"
                  : "Alamat Email"}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    authMode === "register"
                      ? "namaanda@gmail.com"
                      : "nama@email.com"
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                />
                {authMode === "register" && (
                  <button
                    type="button"
                    disabled={otpSending || otpCooldown > 0}
                    onClick={handleRequestGmailOtp}
                    className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 text-xs font-semibold shrink-0 transition"
                  >
                    {otpSending
                      ? "Mengirim..."
                      : otpCooldown > 0
                      ? `Tunggu ${otpCooldown}d`
                      : "Minta Kode"}
                  </button>
                )}
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Kode Verifikasi OTP dari Gmail (6 Digit)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Masukkan 6 digit kode verifikasi"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono tracking-widest text-center text-base focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition"
            >
              {loading
                ? "Memproses..."
                : authMode === "login"
                ? "Masuk Sekarang"
                : "Verifikasi & Buat Akun"}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
            >
              Masuk Instan dengan Akun Demo Kreator
            </button>
          </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-slate-500">
        TokTrend Flow • Product Analytics &amp; AI Studio
      </footer>
    </div>
  );
}
