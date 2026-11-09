"use client";

import React, { useState } from "react";

interface ReferralProps {
  proPriceMonthly: number;
  adminPromoCode: string;
  adminPromoDiscount: number;
  adminWhatsapp?: string;
  currentUserName?: string;
  currentUserEmail?: string;
  isProTier: boolean;
  onActivatePro: () => void;
  onTriggerToast: (msg: string) => void;
}

export default function ReferralAndCheckoutSection({
  proPriceMonthly,
  adminPromoCode,
  adminPromoDiscount,
  adminWhatsapp = "6281234567890",
  currentUserName = "",
  currentUserEmail = "",
  isProTier,
  onTriggerToast,
}: ReferralProps) {
  // Referral State
  const [referralCode] = useState("RINA30CUAN");
  const [referralBalance, setReferralBalance] = useState(267300); // 9 referrals
  const [withdrawMethod, setWithdrawMethod] = useState("BCA - 8291048291");
  const [withdrawHistory, setWithdrawHistory] = useState([
    {
      id: "wd-1",
      date: "Minggu Lalu",
      amount: 178200,
      method: "DANA - 0812xxxx890",
      status: "BERHASIL DICAIRKAN",
    },
  ]);

  // Upgrade via WhatsApp & Voucher State
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [buyerName, setBuyerName] = useState(currentUserName);
  const [buyerEmail, setBuyerEmail] = useState(currentUserEmail);

  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");
  const commissionPerSale = Math.round(proPriceMonthly * 0.3);
  const finalCheckoutPrice = Math.max(0, proPriceMonthly - appliedDiscount);

  const handleApplyVoucher = () => {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    if (code === adminPromoCode.toUpperCase() || code === "CUAN50") {
      setAppliedDiscount(adminPromoDiscount);
      onTriggerToast(
        `Kode Voucher ${code} berhasil dipasang! Potongan ${formatRupiah(
          adminPromoDiscount
        )}.`
      );
    } else {
      onTriggerToast(
        `Kode voucher tidak ditemukan. Gunakan kode promo: ${adminPromoCode}`
      );
    }
  };

  const handleContactWhatsappUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = (adminWhatsapp || "6281234567890").replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("0")
      ? "62" + cleanPhone.slice(1)
      : cleanPhone || "6281234567890";

    const voucherText =
      appliedDiscount > 0
        ? `${voucherInput.trim().toUpperCase()} (Hemat ${formatRupiah(
            appliedDiscount
          )})`
        : "Tidak pakai voucher";

    const message = [
      "Halo Admin TokTrend Flow, saya ingin upgrade akun ke *Paket PRO*.",
      "",
      `• *Nama:* ${buyerName.trim() || "-"}`,
      `• *Email Akun:* ${buyerEmail.trim() || "-"}`,
      `• *Kode Voucher:* ${voucherText}`,
      `• *Total Harga Pro:* ${formatRupiah(finalCheckoutPrice)} / bulan`,
      "",
      "Mohon informasi untuk aktivasi Paket PRO pada akun saya. Terima kasih!",
    ].join("\n");

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    onTriggerToast(
      "Mengarahkan ke WhatsApp Admin untuk proses aktivasi Paket Pro..."
    );
  };

  const handleWithdrawReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (referralBalance <= 0) {
      onTriggerToast("Saldo komisi referral Anda sudah Rp 0.");
      return;
    }
    const amount = referralBalance;
    setWithdrawHistory((prev) => [
      {
        id: "wd-" + Date.now(),
        date: "Baru saja",
        amount,
        method: withdrawMethod,
        status: "DIPROSES ADMIN",
      },
      ...prev,
    ]);
    setReferralBalance(0);
    onTriggerToast(
      `Permintaan pencairan komisi sebesar ${formatRupiah(
        amount
      )} ke ${withdrawMethod} berhasil dikirim!`
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">
          Upgrade Paket Pro via WhatsApp &amp; Program Afiliasi 30%
        </h2>
        <p className="text-sm text-slate-400">
          Untuk mengaktifkan Paket Pro tanpa batas kuota, silakan hubungi Admin
          kami langsung melalui WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 Cols: Upgrade Pro via Direct WhatsApp Contact */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                AKTIVASI MANUAL VIA WHATSAPP ADMIN
              </span>
              <h3 className="font-bold text-base mt-1">
                Upgrade ke Paket Pro Unlimited
              </h3>
            </div>
            {isProTier && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                ✓ PRO AKTIF
              </span>
            )}
          </div>

          {/* Pro Benefits List */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-300">
            <p className="font-semibold text-white">
              Keuntungan Paket Pro ({formatRupiah(proPriceMonthly)} / bulan):
            </p>
            <ul className="space-y-1 text-slate-400">
              <li>• Akses tanpa batas ke detail video &amp; kreator produk viral</li>
              <li>• Generate prompt video AI Google Flow tanpa batas harian</li>
              <li>• Akses penuh detektor produk Newcomer (&lt;14 Hari)</li>
              <li>• Aktivasi cepat langsung oleh Admin melalui WhatsApp</li>
            </ul>
          </div>

          {/* Voucher Code Input */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                Punya Kode Voucher Promo?
              </label>
              <span className="text-emerald-400">
                Kode Promo: <strong>{adminPromoCode}</strong> (Hemat{" "}
                {formatRupiah(adminPromoDiscount)})
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                placeholder={`Ketik ${adminPromoCode} untuk diskon...`}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 uppercase font-mono"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white font-bold transition"
              >
                Pakai Voucher
              </button>
            </div>
          </div>

          {/* Price Summary & WhatsApp Form */}
          <form
            onSubmit={handleContactWhatsappUpgrade}
            className="space-y-3.5 text-xs"
          >
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Harga Langganan Pro (30 Hari)</span>
                <span>{formatRupiah(proPriceMonthly)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Potongan Voucher Promo</span>
                  <span>- {formatRupiah(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Estimasi Total Biaya</span>
                <span className="text-emerald-400">
                  {formatRupiah(finalCheckoutPrice)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  Nama Lengkap Anda
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Contoh: Rina Affiliate"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Email Akun Terdaftar
                </label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>💬 Hubungi Admin di WhatsApp untuk Upgrade Pro</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Setelah menghubungi WhatsApp Admin, status akun Anda akan langsung
              diubah menjadi <strong>PRO</strong> dari Panel Admin.
            </p>
          </form>
        </div>

        {/* Right 6 Cols: Affiliate / Referral Program */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              PROGRAM AFFILIATE / REFERRAL WEBSITE (KOMISI 30%)
            </span>
            <h3 className="font-bold text-base mt-1">
              Ajak Teman Kreator &amp; Dapatkan{" "}
              <span className="text-emerald-400">
                {formatRupiah(commissionPerSale)} / User Pro
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Total Klik Link</p>
              <p className="text-lg font-bold text-white mt-0.5">142 Klik</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Teman Upgrade Pro</p>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">
                9 Kreator
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-slate-400">Saldo Komisi Siap Tarik</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {formatRupiah(referralBalance)}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <label className="block font-bold text-slate-300">
              Link Referral Unik Anda:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`https://toktrend.onyou.cyou/?ref=${referralCode}`}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-emerald-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(
                      `https://toktrend.onyou.cyou/?ref=${referralCode}`
                    );
                  }
                  onTriggerToast("Link Referral berhasil disalin!");
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Salin Link
              </button>
            </div>
          </div>

          <form
            onSubmit={handleWithdrawReferral}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
          >
            <label className="block font-bold text-slate-300">
              Tarik Saldo Komisi Referral ke Rekening / E-Wallet:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                placeholder="Nama Bank / E-Wallet & Nomor Rekening"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0"
              >
                Cairkan {formatRupiah(referralBalance)}
              </button>
            </div>
          </form>

          <div className="space-y-1.5 text-xs">
            <p className="text-slate-400 font-semibold">
              Riwayat Pencairan Komisi:
            </p>
            {withdrawHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <span>
                  <strong>{formatRupiah(item.amount)}</strong> ke {item.method}{" "}
                  ({item.date})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
