"use client";

import React, { useState, useEffect } from "react";
import { ProductItem, TopVideoItem, TopCreatorItem } from "@/lib/mock-data";

export type AccentTheme = "indigo" | "emerald" | "rose" | "amber";

export interface SiteAppearanceConfig {
  brandName: string;
  brandHighlight: string;
  brandSubtitle: string;
  bannerText: string;
  leaderboardTitle: string;
  leaderboardSubtitle?: string;
  ctaButtonText?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  accentTheme: AccentTheme;
  showHeroBanner?: boolean;
  showKpiCards?: boolean;
  showCategoryPills?: boolean;
  tableDensity?: "comfortable" | "compact";
  mobileLayoutMode?: "cards" | "compact";
  proPriceMonthly: number;
  freeDetailQuotaMax: number;
  freePromptQuotaMax: number;
  flashSaleEnabled: boolean;
  flashSaleText: string;
  promoCode: string;
  promoDiscountIdr: number;
  adminPin: string;
  adminWhatsapp?: string;
  smtpGmailUser?: string;
  smtpGmailAppPassword?: string;
}

interface DbUserItem {
  id: string;
  name: string;
  email: string;
  planTier: string;
  dailySearchUsed: number;
  dailyPromptUsed: number;
  createdAt: string;
}

interface AdminCmsPanelProps {
  products: ProductItem[];
  siteConfig: SiteAppearanceConfig;
  uiMode?: "dark" | "hoperise" | "wave";
  onChangeUiMode?: (mode: "dark" | "hoperise" | "wave") => void;
  editingProduct: ProductItem | null;
  isCreatingNewProduct: boolean;
  onSetEditingProduct: (p: ProductItem | null) => void;
  onSetIsCreatingNewProduct: (val: boolean) => void;
  onSaveProducts: (list: ProductItem[]) => void;
  onSaveSiteConfig: (cfg: SiteAppearanceConfig) => void;
  onResetDefaults: () => void;
  onTriggerToast: (msg: string) => void;
  renderProductThumb: (
    p: ProductItem,
    sizeClass?: string
  ) => React.ReactNode;
}

export default function AdminCmsPanel({
  products,
  siteConfig,
  uiMode = "dark",
  onChangeUiMode,
  editingProduct,
  isCreatingNewProduct,
  onSetEditingProduct,
  onSetIsCreatingNewProduct,
  onSaveProducts,
  onSaveSiteConfig,
  onResetDefaults,
  onTriggerToast,
  renderProductThumb,
}: AdminCmsPanelProps) {
  // Admin PIN Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [adminSubTab, setAdminSubTab] = useState<
    "products" | "users" | "appearance"
  >("products");

  // Registered Users State (from SQLite /api/admin/users)
  const [dbUsers, setDbUsers] = useState<DbUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // New Video & Creator inputs inside Product Editor
  const [newVideoCreator, setNewVideoCreator] = useState("");
  const [newVideoViews, setNewVideoViews] = useState("850K");
  const [newVideoSales, setNewVideoSales] = useState("2,100 pcs");
  const [newVideoHook, setNewVideoHook] = useState("");

  const [newCreatorUsername, setNewCreatorUsername] = useState("");
  const [newCreatorFollowers, setNewCreatorFollowers] = useState("120K");
  const [newCreatorSales, setNewCreatorSales] = useState("Rp 185 Jt");

  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");
  const formatShortRupiah = (num: number) => {
    if (num >= 1_000_000_000)
      return "Rp " + (num / 1_000_000_000).toFixed(2) + " M";
    if (num >= 1_000_000) return "Rp " + (num / 1_000_000).toFixed(1) + " Jt";
    return formatRupiah(num);
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem("toktrend_admin_unlocked") === "true") {
        setIsAdminUnlocked(true);
      }
    } catch {}
  }, []);

  const fetchRegisteredUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data?.users) {
        setDbUsers(data.users);
      }
    } catch {
      onTriggerToast("Gagal memuat daftar user dari database.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked && adminSubTab === "users") {
      fetchRegisteredUsers();
    }
  }, [isAdminUnlocked, adminSubTab]);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = siteConfig.adminPin || "123456";
    if (pinInput.trim() === expectedPin) {
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem("toktrend_admin_unlocked", "true");
      } catch {}
      onTriggerToast("🔓 Akses Panel Admin berhasil dibuka!");
    } else {
      onTriggerToast("❌ PIN Admin salah! (Default: 123456)");
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      "id",
      "title",
      "shopName",
      "category",
      "price",
      "commissionRate",
      "sold7d",
      "growth7d",
      "daysListed",
      "activeCreatorsCount",
      "icon",
    ];
    const rows = products.map((p) =>
      [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.shopName.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.price,
        p.commissionRate,
        p.sold7d,
        p.growth7d,
        p.daysListed,
        p.activeCreatorsCount,
        p.icon,
      ].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toktrend_products_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast(
      `⬇️ Berhasil mengekspor ${products.length} produk ke file CSV!`
    );
  };

  // CSV Import Handler
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const lines = reader.result
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        onTriggerToast("File CSV kosong atau tidak memiliki baris data.");
        return;
      }

      const importedProducts: ProductItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i]
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length < 6) continue;
        const price = Number(cols[4]) || 75000;
        const commRate = Number(cols[5]) || 15;
        const sold7d = Number(cols[6]) || 3500;
        const growth7d = Number(cols[7]) || 220;
        const daysListed = Number(cols[8]) || 7;
        const creatorsCount = Number(cols[9]) || 20;

        importedProducts.push({
          id: cols[0] || `prod-csv-${Date.now()}-${i}`,
          shopId: "shop-glowlab",
          icon: cols[10] || "📦",
          title: cols[1] || `Produk Import CSV #${i}`,
          shopName: cols[2] || "Official Store TikTok",
          shopRating: 4.9,
          category: cols[3] || "Beauty & Care",
          price,
          commissionRate: commRate,
          commissionAmount: Math.round((price * commRate) / 100),
          sold7d,
          growth7d,
          gmv7d: price * sold7d,
          daysListed,
          activeCreatorsCount: creatorsCount,
          isNewcomerBreakout: daysListed <= 14,
          sparkline: [20, 35, 55, 75, 95, 130, 170],
          bookmarked: false,
          status: "ACTIVE",
          statusNote: "📤 Diimpor via CSV Admin",
          visualLocks: [
            "Commercial studio product shot",
            "High-resolution packaging texture",
          ],
          hashtags: {
            niche: ["#produkbaruviral", "#tiktokshopindonesia"],
            product: ["#rekomendasiproduk"],
            affiliate: ["#racuntiktok", "#keranjangkuning"],
          },
          topVideos: [
            {
              id: `vid-csv-${i}`,
              creator: "@kreator.viral",
              views: "650K",
              likes: "42K",
              sales: "1,800 pcs",
              hook: "Produk hasil kurasi terbaru yang sedang naik daun minggu ini...",
              videoUrl: "https://www.tiktok.com",
            },
          ],
          topCreators: [
            {
              id: `cr-csv-${i}`,
              username: "@kreator.viral",
              followers: "95K",
              videosCount: 4,
              estSales: "Rp 135 Jt",
            },
          ],
        });
      }

      if (importedProducts.length > 0) {
        onSaveProducts([...importedProducts, ...products]);
        onTriggerToast(
          `✅ Berhasil mengimpor ${importedProducts.length} produk dari CSV!`
        );
      }
    };
    reader.readAsText(file);
  };

  // Admin Product Photo Upload
  const handleAdminProductPhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSetEditingProduct({
          ...editingProduct,
          imageUrl: reader.result,
        });
        onTriggerToast("Foto produk dimuat! Klik Simpan Perubahan Produk.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Top Video to Editing Product
  const handleAddTopVideo = () => {
    if (!editingProduct || !newVideoCreator.trim() || !newVideoHook.trim()) {
      onTriggerToast("Isi username kreator dan kalimat hook video dulu.");
      return;
    }
    const newVid: TopVideoItem = {
      id: "vid-" + Date.now(),
      creator: newVideoCreator.startsWith("@")
        ? newVideoCreator.trim()
        : "@" + newVideoCreator.trim(),
      views: newVideoViews,
      likes: "45K",
      sales: newVideoSales,
      hook: newVideoHook.trim(),
      videoUrl: "https://www.tiktok.com",
    };
    onSetEditingProduct({
      ...editingProduct,
      topVideos: [newVid, ...editingProduct.topVideos],
    });
    setNewVideoCreator("");
    setNewVideoHook("");
    onTriggerToast("Video referensi ditambahkan ke produk ini!");
  };

  const handleRemoveTopVideo = (vidId: string) => {
    if (!editingProduct) return;
    onSetEditingProduct({
      ...editingProduct,
      topVideos: editingProduct.topVideos.filter((v) => v.id !== vidId),
    });
  };

  // Add Top Creator to Editing Product
  const handleAddTopCreator = () => {
    if (!editingProduct || !newCreatorUsername.trim()) return;
    const newCr: TopCreatorItem = {
      id: "cr-" + Date.now(),
      username: newCreatorUsername.startsWith("@")
        ? newCreatorUsername.trim()
        : "@" + newCreatorUsername.trim(),
      followers: newCreatorFollowers,
      videosCount: 5,
      estSales: newCreatorSales,
    };
    onSetEditingProduct({
      ...editingProduct,
      topCreators: [newCr, ...editingProduct.topCreators],
    });
    setNewCreatorUsername("");
    onTriggerToast("Kreator teratas ditambahkan ke produk ini!");
  };

  // Save Editing Product
  const handleSaveAdminProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const computedCommissionAmount = Math.round(
      (editingProduct.price * editingProduct.commissionRate) / 100
    );
    const computedGmv7d = editingProduct.price * editingProduct.sold7d;

    const normalizedProduct: ProductItem = {
      ...editingProduct,
      commissionAmount: computedCommissionAmount,
      gmv7d: computedGmv7d,
    };

    if (isCreatingNewProduct) {
      onSaveProducts([normalizedProduct, ...products]);
      onTriggerToast(`Produk baru "${normalizedProduct.title}" ditambahkan!`);
    } else {
      onSaveProducts(
        products.map((p) =>
          p.id === normalizedProduct.id ? normalizedProduct : p
        )
      );
      onTriggerToast(`Perubahan produk "${normalizedProduct.title}" disimpan!`);
    }

    onSetEditingProduct(null);
    onSetIsCreatingNewProduct(false);
  };

  const handleToggleUserTier = async (user: DbUserItem) => {
    const nextTier = user.planTier === "PRO" ? "FREE" : "PRO";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planTier: nextTier }),
      });
      if (res.ok) {
        setDbUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, planTier: nextTier } : u
          )
        );
        onTriggerToast(
          `Status akun ${user.name} diubah menjadi ${nextTier}!`
        );
      }
    } catch {
      onTriggerToast("Gagal mengubah tier user.");
    }
  };

  const handleResetUserQuota = async (user: DbUserItem) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, resetQuota: true }),
      });
      if (res.ok) {
        setDbUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, dailySearchUsed: 0, dailyPromptUsed: 0 }
              : u
          )
        );
        onTriggerToast(`Kuota harian ${user.name} berhasil di-reset ke 0!`);
      }
    } catch {}
  };

  // PIN Lock Screen if not unlocked yet
  if (!isAdminUnlocked) {
    return (
      <section className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto">
            🔒
          </div>
          <h2 className="text-lg font-bold mt-2">
            Proteksi PIN Panel Admin (CMS)
          </h2>
          <p className="text-xs text-slate-400">
            Masukkan PIN Admin untuk mengelola harga produk, foto, daftar user,
            dan tampilan website.
          </p>
        </div>

        <form onSubmit={handleUnlockPin} className="space-y-3">
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Masukkan PIN Admin (Default: 123456)"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base tracking-widest"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
          >
            🔓 Buka Panel Admin
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setIsAdminUnlocked(true);
              try {
                sessionStorage.setItem("toktrend_admin_unlocked", "true");
              } catch {}
              onTriggerToast("🔓 Masuk instan ke Panel Admin!");
            }}
            className="text-xs text-amber-300 underline hover:text-white font-semibold"
          >
            ⚡ Klik di sini untuk Buka Instan (PIN Default: 123456)
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            🛠️ ADMIN DASHBOARD &amp; CMS LENGKAP
          </span>
          <h2 className="text-xl font-bold mt-1">
            Kelola Produk (CSV), Video Referensi, Manajemen User, &amp; Tampilan
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 transition"
          >
            ⬇️ Export Produk ke CSV
          </button>
          <label className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/30 cursor-pointer transition">
            📤 Import Produk CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportCsv}
              className="hidden"
            />
          </label>
          <button
            onClick={onResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition"
          >
            🔄 Reset Default
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAdminSubTab("products")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            adminSubTab === "products"
              ? "bg-amber-600 text-white"
              : "bg-slate-900 border border-slate-800 text-slate-300"
          }`}
        >
          📦 1. Produk, Harga, Foto &amp; Video Viral ({products.length})
        </button>
        <button
          onClick={() => setAdminSubTab("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            adminSubTab === "users"
              ? "bg-amber-600 text-white"
              : "bg-slate-900 border border-slate-800 text-slate-300"
          }`}
        >
          👥 2. Manajemen User &amp; Langganan Pro
        </button>
        <button
          onClick={() => setAdminSubTab("appearance")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            adminSubTab === "appearance"
              ? "bg-amber-600 text-white"
              : "bg-slate-900 border border-slate-800 text-slate-300"
          }`}
        >
          🎨 3. Tampilan Website, Flash Sale &amp; Kode Voucher
        </button>
      </div>

      {/* SUB-TAB 1: PRODUCTS + TOP VIDEOS EDITOR */}
      {adminSubTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Daftar Produk (Klik untuk Edit)
              </h3>
              <button
                onClick={() => {
                  onSetIsCreatingNewProduct(true);
                  onSetEditingProduct({
                    id: "prod-" + Date.now(),
                    shopId: "shop-glowlab",
                    icon: "✨",
                    imageUrl: "",
                    title: "Produk Baru Trending TikTok Shop",
                    shopName: "Official Brand Store ID",
                    shopRating: 4.9,
                    category: "Beauty & Care",
                    price: 99000,
                    commissionRate: 18,
                    commissionAmount: 17820,
                    sold7d: 5400,
                    growth7d: 310,
                    gmv7d: 534600000,
                    daysListed: 7,
                    activeCreatorsCount: 18,
                    isNewcomerBreakout: true,
                    sparkline: [20, 35, 50, 75, 110, 150, 210],
                    bookmarked: false,
                    status: "ACTIVE",
                    statusNote: "🐣 Produk Baru Ditambahkan Admin",
                    visualLocks: ["Clean studio product packaging"],
                    hashtags: {
                      niche: ["#produkbaruviral"],
                      product: ["#spillproduk"],
                      affiliate: ["#racuntiktok", "#keranjangkuning"],
                    },
                    topVideos: [],
                    topCreators: [],
                  });
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                ➕ Tambah Produk Baru
              </button>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSetIsCreatingNewProduct(false);
                    onSetEditingProduct(p);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    editingProduct?.id === p.id
                      ? "bg-amber-500/10 border-amber-500"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderProductThumb(p, "w-12 h-12 text-xl")}
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-white truncate">
                        {p.title}
                      </p>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                        {formatRupiah(p.price)} • Komisi {p.commissionRate}%
                      </p>
                      <p className="text-xs text-slate-400">
                        🎥 {p.topVideos.length} Video • 👩‍💻{" "}
                        {p.topCreators.length} Kreator
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (products.length <= 1) return;
                      onSaveProducts(products.filter((x) => x.id !== p.id));
                      if (editingProduct?.id === p.id) onSetEditingProduct(null);
                      onTriggerToast(`Produk "${p.title}" dihapus.`);
                    }}
                    className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 text-xs font-semibold"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {!editingProduct ? (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                <p className="text-3xl">🛠️📦</p>
                <h4 className="font-bold text-base">
                  Pilih Produk di Sebelah Kiri untuk Mengubah Data
                </h4>
                <p className="text-xs text-slate-400 max-w-md">
                  Ubah harga, komisi, upload foto produk, atau kelola daftar
                  video viral &amp; kreator teratas untuk produk tersebut.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSaveAdminProduct}
                className="space-y-4 text-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-amber-300">
                    {isCreatingNewProduct
                      ? "➕ Tambah Produk Baru"
                      : `✏️ Edit: ${editingProduct.title}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onSetEditingProduct(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Batal
                  </button>
                </div>

                {/* Photo Upload */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                  {renderProductThumb(editingProduct, "w-20 h-20 text-3xl")}
                  <div className="flex-1 space-y-2 w-full">
                    <label className="block text-xs font-bold text-slate-300">
                      📸 Foto Produk (Upload dari Komputer atau URL)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer">
                        📤 Upload Foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdminProductPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {editingProduct.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            onSetEditingProduct({
                              ...editingProduct,
                              imageUrl: "",
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-xs text-rose-300"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <input
                        type="text"
                        value={editingProduct.imageUrl || ""}
                        onChange={(e) =>
                          onSetEditingProduct({
                            ...editingProduct,
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="URL foto produk (https://...)"
                        className="col-span-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        value={editingProduct.icon}
                        onChange={(e) =>
                          onSetEditingProduct({
                            ...editingProduct,
                            icon: e.target.value,
                          })
                        }
                        placeholder="Emoji"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.title}
                      onChange={(e) =>
                        onSetEditingProduct({
                          ...editingProduct,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Kategori
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        onSetEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    >
                      <option value="Beauty & Care">Beauty & Care</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Gadget & Aksesoris">
                        Gadget & Aksesoris
                      </option>
                      <option value="Fashion & Muslim">Fashion & Muslim</option>
                    </select>
                  </div>
                </div>

                {/* Price, Commission, Sold */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Harga (Rp)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        onSetEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Komisi (%)
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      value={editingProduct.commissionRate}
                      onChange={(e) =>
                        onSetEditingProduct({
                          ...editingProduct,
                          commissionRate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Terjual 7d (pcs)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.sold7d}
                      onChange={(e) =>
                        onSetEditingProduct({
                          ...editingProduct,
                          sold7d: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                </div>

                {/* Manage Top Promoting Videos for this Product */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200">
                    🎥 Kelola Daftar Video Viral &amp; Hook Referensi (
                    {editingProduct.topVideos.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newVideoCreator}
                      onChange={(e) => setNewVideoCreator(e.target.value)}
                      placeholder="@username_kreator"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <input
                      type="text"
                      value={newVideoViews}
                      onChange={(e) => setNewVideoViews(e.target.value)}
                      placeholder="Views (mis: 1.2M)"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <input
                      type="text"
                      value={newVideoSales}
                      onChange={(e) => setNewVideoSales(e.target.value)}
                      placeholder="Terjual (mis: 2,400 pcs)"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVideoHook}
                      onChange={(e) => setNewVideoHook(e.target.value)}
                      placeholder="Kalimat Hook 3 detik pertama video tersebut..."
                      className="flex-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopVideo}
                      className="px-3 py-1.5 rounded bg-indigo-600 text-white font-bold shrink-0"
                    >
                      + Tambah Video
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {editingProduct.topVideos.map((v) => (
                      <div
                        key={v.id}
                        className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          <strong>{v.creator}</strong> ({v.views} • {v.sales}):
                          &ldquo;{v.hook}&rdquo;
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopVideo(v.id)}
                          className="text-rose-400 font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage Top Creators for this Product */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-bold text-slate-200">
                    👩‍💻 Tambah Kreator / Affiliator Teratas (
                    {editingProduct.topCreators.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newCreatorUsername}
                      onChange={(e) => setNewCreatorUsername(e.target.value)}
                      placeholder="@username"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <input
                      type="text"
                      value={newCreatorFollowers}
                      onChange={(e) => setNewCreatorFollowers(e.target.value)}
                      placeholder="Followers (150K)"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <input
                      type="text"
                      value={newCreatorSales}
                      onChange={(e) => setNewCreatorSales(e.target.value)}
                      placeholder="GMV (Rp 210 Jt)"
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddTopCreator}
                      className="px-3 py-1.5 rounded bg-indigo-600 text-white font-bold"
                    >
                      + Kreator
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg"
                  >
                    💾 Simpan Seluruh Perubahan Produk
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USER & SUBSCRIPTION MANAGEMENT */}
      {adminSubTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">
                👥 Daftar User Terdaftar di Database SQLite
              </h3>
              <p className="text-xs text-slate-400">
                Ubah status langganan user dari FREE ke PRO secara manual atau
                reset kuota harian mereka.
              </p>
            </div>
            <button
              onClick={fetchRegisteredUsers}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold"
            >
              🔄 Segarkan Data
            </button>
          </div>

          {loadingUsers ? (
            <p className="text-xs text-slate-400 py-4">Memuat data user...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase">
                    <th className="py-3 px-4">Nama &amp; Email</th>
                    <th className="py-3 px-4">Status Paket</th>
                    <th className="py-3 px-4">Pemakaian Kuota Hari Ini</th>
                    <th className="py-3 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {dbUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 px-4">
                        <p className="font-bold text-sm text-white">{u.name}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold ${
                            u.planTier === "PRO"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {u.planTier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        Pencarian: {u.dailySearchUsed}x • Prompt Flow:{" "}
                        {u.dailyPromptUsed}x
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleUserTier(u)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold"
                        >
                          {u.planTier === "PRO"
                            ? "Ubah ke FREE"
                            : "⚡ Jadikan PRO"}
                        </button>
                        <button
                          onClick={() => handleResetUserQuota(u)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold"
                        >
                          Reset Kuota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: FULL UI BUILDER, LAYOUT TOGGLES, MOBILE VIEW & VOUCHER CONFIG */}
      {adminSubTab === "appearance" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-amber-300">
                🎨 Kustomisasi UI, Tata Letak Halaman, &amp; Tampilan Mobile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Semua perubahan teks, elemen halaman, warna tema, dan gaya tampilan HP langsung tersimpan dan diterapkan secara real-time.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onTriggerToast("Perubahan tampilan UI berhasil disimpan!")
              }
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shrink-0"
            >
              ✓ Simpan &amp; Terapkan UI
            </button>
          </div>

          {/* SECTION A: MODE TEMA & WARNA AKSEN */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Mode Tema Dasar &amp; Warna Aksen
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                {
                  id: "dark" as const,
                  label: "Mode Gelap Profesional",
                  desc: "Tampilan bersih & tenang (Rekomendasi)",
                },
                {
                  id: "hoperise" as const,
                  label: "Mode Terang (Warm Light)",
                  desc: "Latar krem hangat & kontras jelas",
                },
                {
                  id: "wave" as const,
                  label: "Mode Midnight Accent",
                  desc: "Gelap pekat dengan aksen elektrik",
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeUiMode && onChangeUiMode(m.id)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    uiMode === m.id
                      ? "bg-emerald-500/15 border-emerald-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-sm">{m.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-slate-400">
                Warna Tombol &amp; Aksen Utama:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                {(
                  [
                    { id: "emerald", label: "Emerald (Hijau Bisnis)" },
                    { id: "indigo", label: "Indigo (Biru Modern)" },
                    { id: "rose", label: "Rose (Merah Muda)" },
                    { id: "amber", label: "Amber (Emas Hangat)" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      onSaveSiteConfig({ ...siteConfig, accentTheme: t.id })
                    }
                    className={`p-2.5 rounded-xl border transition ${
                      siteConfig.accentTheme === t.id
                        ? "bg-white text-slate-950 border-white"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION B: KONTROL KOMPONEN & TATA LETAK (DESKTOP & MOBILE) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Tata Letak Elemen Halaman &amp; Tampilan Mobile (HP)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Toggle KPI Cards */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-200">
                    Kartu Ringkasan KPI (3 Kotak)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Total SKU, Estimasi GMV, &amp; Newcomer
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      showKpiCards: !(siteConfig.showKpiCards ?? true),
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${
                    (siteConfig.showKpiCards ?? true)
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {(siteConfig.showKpiCards ?? true) ? "Tampil" : "Sembunyi"}
                </button>
              </div>

              {/* Toggle Category Quick Pills */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-200">
                    Tombol Filter Cepat Kategori
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Baris tombol kategori di atas tabel
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      showCategoryPills: !(siteConfig.showCategoryPills ?? true),
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${
                    (siteConfig.showCategoryPills ?? true)
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {(siteConfig.showCategoryPills ?? true)
                    ? "Tampil"
                    : "Sembunyi"}
                </button>
              </div>

              {/* Toggle Optional Hero Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-200">
                    Banner Sambutan Atas
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Matikan agar tampilan lebih ringkas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      showHeroBanner: !(siteConfig.showHeroBanner ?? false),
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 ${
                    siteConfig.showHeroBanner
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {siteConfig.showHeroBanner ? "Tampil" : "Sembunyi"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Gaya Tampilan Produk di Layar HP (Mobile):
                </label>
                <select
                  value={siteConfig.mobileLayoutMode || "cards"}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      mobileLayoutMode: e.target.value as "cards" | "compact",
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                >
                  <option value="cards">
                    Kartu Produk Lengkap (Foto + Metrik + Tombol)
                  </option>
                  <option value="compact">
                    Daftar Ringkas (Hemat Ruang Layar HP)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Kerapatan Tabel &amp; Spasi:
                </label>
                <select
                  value={siteConfig.tableDensity || "comfortable"}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      tableDensity: e.target.value as
                        | "comfortable"
                        | "compact",
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                >
                  <option value="comfortable">
                    Lega &amp; Nyaman Dibaca (Rekomendasi)
                  </option>
                  <option value="compact">
                    Padat (Tampilkan Lebih Banyak Baris)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION C: TEKS, JUDUL & BRANDING */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              3. Edit Teks Brand, Judul Halaman, &amp; Tombol Utama
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nama Brand Utama
                </label>
                <input
                  type="text"
                  value={siteConfig.brandName}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      brandName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Kata Highlight Brand
                </label>
                <input
                  type="text"
                  value={siteConfig.brandHighlight}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      brandHighlight: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Teks Tombol CTA Utama
                </label>
                <input
                  type="text"
                  value={siteConfig.ctaButtonText || "Buka Studio Prompt AI"}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      ctaButtonText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tagline Header Atas
                </label>
                <input
                  type="text"
                  value={siteConfig.bannerText}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      bannerText: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Judul Utama Halaman Produk
                </label>
                <input
                  type="text"
                  value={siteConfig.leaderboardTitle}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      leaderboardTitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Deskripsi di Bawah Judul Halaman
              </label>
              <input
                type="text"
                value={
                  siteConfig.leaderboardSubtitle ||
                  "Pantau metrik penjualan 7 hari, temukan produk pendatang baru (Newcomer), dan buat prompt video AI."
                }
                onChange={(e) =>
                  onSaveSiteConfig({
                    ...siteConfig,
                    leaderboardSubtitle: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
              />
            </div>

            {siteConfig.showHeroBanner && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs text-emerald-400 mb-1">
                    Judul Banner Sambutan Atas
                  </label>
                  <input
                    type="text"
                    value={
                      siteConfig.heroBannerTitle ||
                      "Riset Produk Viral & Studio Prompt Video AI"
                    }
                    onChange={(e) =>
                      onSaveSiteConfig({
                        ...siteConfig,
                        heroBannerTitle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-emerald-400 mb-1">
                    Sub-judul Banner Sambutan Atas
                  </label>
                  <input
                    type="text"
                    value={
                      siteConfig.heroBannerSubtitle ||
                      "Analisis komisi, kecepatan penjualan 7 hari, dan buat skrip video TikTok dalam hitungan detik."
                    }
                    onChange={(e) =>
                      onSaveSiteConfig({
                        ...siteConfig,
                        heroBannerSubtitle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: FLASH SALE & VOUCHER CONFIG */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-300 uppercase">
                4. Pengaturan Banner Promo Atas &amp; Voucher Langganan Pro
              </span>
              <button
                type="button"
                onClick={() =>
                  onSaveSiteConfig({
                    ...siteConfig,
                    flashSaleEnabled: !siteConfig.flashSaleEnabled,
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  siteConfig.flashSaleEnabled
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {siteConfig.flashSaleEnabled
                  ? "Banner Promo AKTIF"
                  : "Banner Promo NONAKTIF"}
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Teks Pengumuman Promo
              </label>
              <input
                type="text"
                value={siteConfig.flashSaleText}
                onChange={(e) =>
                  onSaveSiteConfig({
                    ...siteConfig,
                    flashSaleText: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Harga Normal Pro (Rp)
                </label>
                <input
                  type="number"
                  value={siteConfig.proPriceMonthly}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      proPriceMonthly: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Kode Voucher Diskon
                </label>
                <input
                  type="text"
                  value={siteConfig.promoCode}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      promoCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  Nominal Diskon (Rp)
                </label>
                <input
                  type="number"
                  value={siteConfig.promoDiscountIdr}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      promoDiscountIdr: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  PIN Admin Baru
                </label>
                <input
                  type="text"
                  value={siteConfig.adminPin}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      adminPin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION E: WHATSAPP UPGRADE CONTACT & GMAIL OTP SMTP CONFIG */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-sm">
            <div>
              <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
                5. Nomor WhatsApp Admin (Upgrade Pro) &amp; Pengirim Kode OTP Gmail
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Atur nomor WhatsApp tujuan saat user ingin upgrade ke Pro, serta kredensial Gmail App Password untuk mengirim kode verifikasi 6 digit ke inbox pendaftar baru.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nomor WhatsApp Admin (Format 628...)
                </label>
                <input
                  type="text"
                  value={siteConfig.adminWhatsapp || "6281234567890"}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      adminWhatsapp: e.target.value,
                    })
                  }
                  placeholder="Contoh: 6281234567890"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email Gmail Pengirim OTP (Opsional)
                </label>
                <input
                  type="email"
                  value={siteConfig.smtpGmailUser || ""}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      smtpGmailUser: e.target.value,
                    })
                  }
                  placeholder="adminanda@gmail.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Gmail App Password (16 Karakter)
                </label>
                <input
                  type="password"
                  value={siteConfig.smtpGmailAppPassword || ""}
                  onChange={(e) =>
                    onSaveSiteConfig({
                      ...siteConfig,
                      smtpGmailAppPassword: e.target.value,
                    })
                  }
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
