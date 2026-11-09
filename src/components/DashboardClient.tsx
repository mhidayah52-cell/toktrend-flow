"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ProductItem, ShopItem } from "@/lib/mock-data";
import {
  FlowStyle,
  FlowGenerationResult,
  generateFlowPackage,
} from "@/lib/flow-engine";
import TikTokTrackerAndPlanner from "./TikTokTrackerAndPlanner";
import ReferralAndCheckoutSection from "./ReferralAndCheckoutSection";
import AdminCmsPanel, {
  AccentTheme,
  SiteAppearanceConfig,
} from "./AdminCmsPanel";

interface DashboardClientProps {
  initialProducts: ProductItem[];
  initialShops: ShopItem[];
}

type ActiveTab =
  | "trending"
  | "tiktoktracker"
  | "ondemand"
  | "flowstudio"
  | "hookstudio"
  | "calculator"
  | "referral"
  | "shops"
  | "watchlist"
  | "settings"
  | "admin";

const DEFAULT_SITE_CONFIG: SiteAppearanceConfig = {
  brandName: "TokTrend",
  brandHighlight: "Flow",
  brandSubtitle: "Product Analytics & AI Studio",
  bannerText: "Analitik Produk TikTok Shop & Generator Prompt Google Flow",
  leaderboardTitle: "Daftar Produk Trending (7 Hari Terakhir)",
  leaderboardSubtitle:
    "Pantau metrik penjualan 7 hari, temukan produk pendatang baru (Newcomer), dan buat prompt video AI.",
  ctaButtonText: "Buka Studio Prompt AI",
  heroBannerTitle: "Riset Produk Viral & Studio Prompt Video AI",
  heroBannerSubtitle:
    "Analisis komisi, kecepatan penjualan 7 hari, dan buat skrip video TikTok dalam hitungan detik.",
  accentTheme: "emerald",
  showHeroBanner: false,
  showKpiCards: true,
  showCategoryPills: true,
  tableDensity: "comfortable",
  mobileLayoutMode: "cards",
  proPriceMonthly: 99000,
  freeDetailQuotaMax: 5,
  freePromptQuotaMax: 3,
  flashSaleEnabled: false,
  flashSaleText:
    "Gunakan kode voucher di bawah untuk potongan harga langganan PRO.",
  promoCode: "CUAN30",
  promoDiscountIdr: 30000,
  adminPin: "123456",
  adminWhatsapp: "6281234567890",
};

interface PromptHistoryEntry {
  id: string;
  createdAt: string;
  productTitle: string;
  style: FlowStyle;
  result: FlowGenerationResult;
}

export default function DashboardClient({
  initialProducts,
  initialShops,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("trending");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [shops] = useState<ShopItem[]>(initialShops);

  // Site Appearance & Branding Config (Admin CMS)
  const [siteConfig, setSiteConfig] =
    useState<SiteAppearanceConfig>(DEFAULT_SITE_CONFIG);

  // UI Mode: "dark" (Clean Professional Dark) | "hoperise" (Clean Light) | "wave" (Midnight Accent)
  const [uiMode, setUiMode] = useState<"wave" | "hoperise" | "dark">("dark");

  // Flash Sale Countdown State (seconds)
  const [flashCountdown, setFlashCountdown] = useState<number>(3 * 3600 + 1420);

  // Admin Product Editor State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null
  );
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);

  // Filter & Sort State
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("ALL");
  const [minCommission, setMinCommission] = useState(0);
  const [onlyNewcomerBreakout, setOnlyNewcomerBreakout] = useState(false);
  const [sortBy, setSortBy] = useState<"growth" | "sold" | "gmv" | "commission">(
    "growth"
  );

  // Freemium Quota State
  const [isProTier, setIsProTier] = useState(false);
  const [detailQuotaUsed, setDetailQuotaUsed] = useState(1);
  const [promptQuotaUsed, setPromptQuotaUsed] = useState(1);
  const detailQuotaMax = siteConfig.freeDetailQuotaMax;
  const promptQuotaMax = siteConfig.freePromptQuotaMax;

  // Modals State
  const [selectedProductModal, setSelectedProductModal] =
    useState<ProductItem | null>(null);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Auth State (Login & Register)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    planTier: string;
    role?: string;
  } | null>(null);
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === "ADMIN" ||
        currentUser.email.toLowerCase() === "admin@toktrend.id")
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authOtpCode, setAuthOtpCode] = useState("");
  const [authOtpToken, setAuthOtpToken] = useState("");
  const [authOtpSending, setAuthOtpSending] = useState(false);
  const [authOtpInfo, setAuthOtpInfo] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // On-Demand Scraper State
  const [tiktokUrl, setTiktokUrl] = useState(
    "https://vt.tiktok.com/ZS8portableFanTurbo/"
  );
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedProduct, setScrapedProduct] = useState<ProductItem | null>(
    null
  );
  const [winningScore, setWinningScore] = useState<number>(92);

  // Google Flow Studio State + Image Upload Ingredient Extraction
  const [selectedFlowProductId, setSelectedFlowProductId] = useState<string>(
    initialProducts[0]?.id || "prod-1"
  );
  const [selectedFlowStyle, setSelectedFlowStyle] =
    useState<FlowStyle>("problem_solution");
  const [customVisualNote, setCustomVisualNote] = useState("");
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(
    null
  );
  const [flowPackage, setFlowPackage] = useState<FlowGenerationResult>(() =>
    generateFlowPackage(initialProducts[0], "problem_solution")
  );
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);

  // AI Hook & Teleprompter State
  const [teleprompterText, setTeleprompterText] = useState<string>(
    () =>
      generateFlowPackage(initialProducts[0], "problem_solution")
        .hookFormulas[0]?.fullTeleprompterScript || ""
  );
  const [isTeleprompterPlaying, setIsTeleprompterPlaying] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(2);
  const [teleprompterFontSize, setTeleprompterFontSize] = useState(24);
  const teleprompterBoxRef = useRef<HTMLDivElement | null>(null);

  // Affiliate ROI & Profit Calculator State
  const [calcProductId, setCalcProductId] = useState<string>(
    initialProducts[0]?.id || "prod-1"
  );
  const [targetMonthlyIncome, setTargetMonthlyIncome] =
    useState<number>(10000000);
  const [estimatedCtrPercent, setEstimatedCtrPercent] = useState<number>(3.5);
  const [estimatedCvrPercent, setEstimatedCvrPercent] = useState<number>(4.0);
  const [dailyAdSpend, setDailyAdSpend] = useState<number>(50000);

  // Personal API Keys State (Settings Tab)
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [apifyApiToken, setApifyApiToken] = useState("");
  const [rapidApiKey, setRapidApiKey] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // Flash Sale Countdown Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashCountdown((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Dynamic Theme Classes
  const themeClasses = useMemo(() => {
    const map: Record<
      AccentTheme,
      {
        bgPrimary: string;
        bgPrimaryHover: string;
        textAccent: string;
        borderAccent: string;
      }
    > = {
      indigo: {
        bgPrimary: "bg-indigo-600",
        bgPrimaryHover: "hover:bg-indigo-500",
        textAccent: "text-indigo-400",
        borderAccent: "border-indigo-500",
      },
      emerald: {
        bgPrimary: "bg-emerald-600",
        bgPrimaryHover: "hover:bg-emerald-500",
        textAccent: "text-emerald-400",
        borderAccent: "border-emerald-500",
      },
      rose: {
        bgPrimary: "bg-rose-600",
        bgPrimaryHover: "hover:bg-rose-500",
        textAccent: "text-rose-400",
        borderAccent: "border-rose-500",
      },
      amber: {
        bgPrimary: "bg-amber-600",
        bgPrimaryHover: "hover:bg-amber-500",
        textAccent: "text-amber-400",
        borderAccent: "border-amber-500",
      },
    };
    return map[siteConfig.accentTheme] || map.indigo;
  }, [siteConfig.accentTheme]);

  // Load current session user & saved admin data on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          if (data.user.planTier === "PRO") setIsProTier(true);
        }
      })
      .catch(() => {});

    try {
      const savedGemini = localStorage.getItem("toktrend_gemini_key") || "";
      const savedApify = localStorage.getItem("toktrend_apify_token") || "";
      const savedRapid = localStorage.getItem("toktrend_rapid_key") || "";
      setGeminiApiKey(savedGemini);
      setApifyApiToken(savedApify);
      setRapidApiKey(savedRapid);

      const savedProductsJson = localStorage.getItem(
        "toktrend_admin_products_v1"
      );
      if (savedProductsJson) {
        const parsed = JSON.parse(savedProductsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hydrated = parsed.map((item: ProductItem) => {
            if (!item.imageUrl) {
              const match = initialProducts.find((ip) => ip.id === item.id);
              if (match?.imageUrl) {
                return { ...item, imageUrl: match.imageUrl };
              }
            }
            return item;
          });
          setProducts(hydrated);
        }
      }

      const savedSiteConfigJson = localStorage.getItem(
        "toktrend_admin_site_config_v2"
      );
      if (savedSiteConfigJson) {
        const parsedConfig = JSON.parse(savedSiteConfigJson);
        setSiteConfig((prev) => ({ ...prev, ...parsedConfig }));
      }

      const savedUiMode = localStorage.getItem("toktrend_ui_mode_v3");
      if (
        savedUiMode === "wave" ||
        savedUiMode === "dark" ||
        savedUiMode === "hoperise"
      ) {
        setUiMode(savedUiMode);
      }
    } catch {}
  }, [initialProducts]);

  const handleToggleUiMode = (mode: "wave" | "hoperise" | "dark") => {
    setUiMode(mode);
    try {
      localStorage.setItem("toktrend_ui_mode_v3", mode);
    } catch {}
  };

  const saveProductsToStorage = (updatedList: ProductItem[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem(
        "toktrend_admin_products_v1",
        JSON.stringify(updatedList)
      );
    } catch {}
  };

  const saveSiteConfigToStorage = (updatedConfig: SiteAppearanceConfig) => {
    setSiteConfig(updatedConfig);
    try {
      localStorage.setItem(
        "toktrend_admin_site_config_v2",
        JSON.stringify(updatedConfig)
      );
    } catch {}
  };

  const handleResetAdminDefaults = () => {
    saveProductsToStorage(initialProducts);
    saveSiteConfigToStorage(DEFAULT_SITE_CONFIG);
    localStorage.removeItem("toktrend_admin_products_v1");
    localStorage.removeItem("toktrend_admin_site_config_v2");
    triggerToast("Seluruh data produk & tampilan dikembalikan ke default!");
  };

  // Teleprompter Auto-Scroll Interval
  useEffect(() => {
    if (!isTeleprompterPlaying) return;
    const interval = setInterval(() => {
      if (teleprompterBoxRef.current) {
        teleprompterBoxRef.current.scrollTop += teleprompterSpeed;
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isTeleprompterPlaying, teleprompterSpeed]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      const matchKeyword =
        p.title.toLowerCase().includes(keyword.toLowerCase()) ||
        p.shopName.toLowerCase().includes(keyword.toLowerCase());
      const matchCat = category === "ALL" || p.category === category;
      const matchComm = p.commissionRate >= minCommission;
      const matchNewcomer = !onlyNewcomerBreakout || p.isNewcomerBreakout;
      return matchKeyword && matchCat && matchComm && matchNewcomer;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "growth") return b.growth7d - a.growth7d;
      if (sortBy === "sold") return b.sold7d - a.sold7d;
      if (sortBy === "gmv") return b.gmv7d - a.gmv7d;
      if (sortBy === "commission")
        return b.commissionAmount - a.commissionAmount;
      return 0;
    });
  }, [
    products,
    keyword,
    category,
    minCommission,
    onlyNewcomerBreakout,
    sortBy,
  ]);

  // Recompute Flow package when selection changes
  useEffect(() => {
    const target =
      products.find((p) => p.id === selectedFlowProductId) || products[0];
    if (target) {
      const pkg = generateFlowPackage(
        target,
        selectedFlowStyle,
        customVisualNote
      );
      setFlowPackage(pkg);
      if (pkg.hookFormulas[0]) {
        setTeleprompterText(pkg.hookFormulas[0].fullTeleprompterScript);
      }
    }
  }, [selectedFlowProductId, selectedFlowStyle, products, customVisualNote]);

  // Calculator Derived Metrics
  const calcMetrics = useMemo(() => {
    const prod = products.find((p) => p.id === calcProductId) || products[0];
    const commPerUnit = prod.commissionAmount;
    const unitsNeededMonthly = Math.max(
      1,
      Math.ceil(targetMonthlyIncome / Math.max(1, commPerUnit))
    );
    const unitsNeededDaily = Math.ceil(unitsNeededMonthly / 30);
    const clicksNeededMonthly = Math.ceil(
      unitsNeededMonthly / Math.max(0.001, estimatedCvrPercent / 100)
    );
    const viewsNeededMonthly = Math.ceil(
      clicksNeededMonthly / Math.max(0.001, estimatedCtrPercent / 100)
    );
    const monthlyAdCost = dailyAdSpend * 30;
    const netMonthlyProfit = targetMonthlyIncome - monthlyAdCost;
    const estimatedGmvGenerated = unitsNeededMonthly * prod.price;

    return {
      prod,
      commPerUnit,
      unitsNeededMonthly,
      unitsNeededDaily,
      clicksNeededMonthly,
      viewsNeededMonthly,
      monthlyAdCost,
      netMonthlyProfit,
      estimatedGmvGenerated,
    };
  }, [
    products,
    calcProductId,
    targetMonthlyIncome,
    estimatedCtrPercent,
    estimatedCvrPercent,
    dailyAdSpend,
  ]);

  // Format Helpers
  const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");
  const formatShortRupiah = (num: number) => {
    if (num >= 1_000_000_000)
      return "Rp " + (num / 1_000_000_000).toFixed(2) + " M";
    if (num >= 1_000_000) return "Rp " + (num / 1_000_000).toFixed(1) + " Jt";
    return formatRupiah(num);
  };

  // Reusable Product Thumbnail Renderer
  const renderProductThumb = (
    p: ProductItem,
    sizeClass = "w-11 h-11 text-xl"
  ) => {
    if (p.imageUrl) {
      return (
        <img
          src={p.imageUrl}
          alt={p.title}
          className={`${sizeClass} rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-xl bg-slate-800 flex items-center justify-center shrink-0`}
      >
        {p.icon}
      </div>
    );
  };

  // Auth Handlers
  const handleRequestModalGmailOtp = async () => {
    setAuthError(null);
    setAuthOtpInfo(null);
    const cleanEmail = authEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.endsWith("@gmail.com")) {
      setAuthError(
        "Pendaftaran akun wajib menggunakan alamat email Google (@gmail.com)."
      );
      return;
    }

    setAuthOtpSending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          smtpUser: siteConfig.smtpGmailUser || "",
          smtpPass: siteConfig.smtpGmailAppPassword || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Gagal mengirim kode verifikasi ke Gmail.");
      } else {
        if (data.otpToken) setAuthOtpToken(data.otpToken);
        setAuthOtpInfo(
          data.message || `Kode verifikasi dikirim ke ${cleanEmail}.`
        );
      }
    } catch {
      setAuthError("Gagal menghubungi server verifikasi email.");
    } finally {
      setAuthOtpSending(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authMode === "register") {
      if (!authEmail.trim().toLowerCase().endsWith("@gmail.com")) {
        setAuthError("Pendaftaran wajib menggunakan alamat email @gmail.com.");
        return;
      }
      if (!authOtpCode.trim()) {
        setAuthError(
          "Masukkan 6 digit kode verifikasi yang dikirim ke Gmail Anda."
        );
        return;
      }
    }
    setAuthLoading(true);
    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        authMode === "login"
          ? { email: authEmail, password: authPassword }
          : {
              name: authName,
              email: authEmail,
              password: authPassword,
              otpCode: authOtpCode.trim(),
              otpToken: authOtpToken,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Autentikasi gagal.");
      } else {
        setCurrentUser(data.user);
        if (
          data.user.planTier === "PRO" ||
          data.user.role === "ADMIN" ||
          String(data.user.email || "").toLowerCase() === "admin@toktrend.id"
        ) {
          setIsProTier(true);
        }
        setShowAuthModal(false);
        setAuthPassword("");
        triggerToast(
          authMode === "login"
            ? `Selamat datang kembali, ${data.user.name}!`
            : `Akun ${data.user.name} berhasil dibuat!`
        );
      }
    } catch {
      setAuthError("Gagal menghubungi server autentikasi.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
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
        setCurrentUser(data.user);
        setShowAuthModal(false);
        triggerToast(`Masuk sebagai akun demo: ${data.user.name}`);
      } else {
        setAuthError(data.error || "Gagal masuk akun demo.");
      }
    } catch {
      setAuthError("Gagal menghubungi server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    if (activeTab === "admin") {
      setActiveTab("trending");
    }
    triggerToast("Anda telah keluar (Logout).");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedImagePreview(reader.result);
        const extractedNote = `Uploaded reference photo (${file.name.replace(
          /\.[^/.]+$/,
          ""
        )}), studio cutout fidelity, exact packaging proportions`;
        setCustomVisualNote(extractedNote);
        triggerToast(
          "Foto produk berhasil dianalisis! Subject Lock otomatis ditambahkan ke Prompt Flow."
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleBookmark = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, bookmarked: !p.bookmarked } : p
    );
    saveProductsToStorage(updated);
    const target = products.find((p) => p.id === productId);
    triggerToast(
      target && !target.bookmarked
        ? "Produk ditambahkan ke Watchlist!"
        : "Produk dihapus dari Watchlist."
    );
  };

  const handleOpenProductDetail = (product: ProductItem) => {
    if (!isProTier && detailQuotaUsed >= detailQuotaMax) {
      setShowPaywallModal(true);
      return;
    }
    if (!isProTier) {
      setDetailQuotaUsed((prev) => prev + 1);
    }
    setSelectedProductModal(product);
  };

  const handleOpenFlowWithProduct = (product: ProductItem) => {
    if (!products.some((p) => p.id === product.id)) {
      saveProductsToStorage([product, ...products]);
    }
    setSelectedFlowProductId(product.id);
    setActiveTab("flowstudio");
  };

  const handleRunOnDemandScrape = async () => {
    setScrapeError(null);
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tiktokUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScrapeError(data.error || "Gagal menarik data produk TikTok.");
      } else {
        setScrapedProduct(data.product);
        setWinningScore(data.winningScore);
        if (!products.some((p) => p.id === data.product.id)) {
          saveProductsToStorage([data.product, ...products]);
        }
        triggerToast("Berhasil mengekstrak metrik produk dari link TikTok!");
      }
    } catch {
      setScrapeError("Terjadi gangguan jaringan saat menghubungi scraper.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleGenerateFlowAPI = async () => {
    if (!isProTier && promptQuotaUsed >= promptQuotaMax) {
      setShowPaywallModal(true);
      return;
    }
    const target =
      products.find((p) => p.id === selectedFlowProductId) || products[0];
    try {
      const res = await fetch("/api/flow-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: target.id,
          style: selectedFlowStyle,
          customVisualNote: customVisualNote.trim() || undefined,
          customProduct: target,
        }),
      });
      if (res.ok) {
        const pkg: FlowGenerationResult = await res.json();
        setFlowPackage(pkg);
        setPromptHistory((prev) => [
          {
            id: "hist-" + Date.now(),
            createdAt: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            productTitle: target.title,
            style: selectedFlowStyle,
            result: pkg,
          },
          ...prev,
        ]);
        if (!isProTier) {
          setPromptQuotaUsed((prev) => prev + 1);
        }
        triggerToast(
          "Skenario Prompt Google Flow & Storyboard berhasil disimpan ke Riwayat!"
        );
      }
    } catch {
      triggerToast("Gagal menghubungi server AI, kuota Anda tidak dipotong.");
    }
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("toktrend_gemini_key", geminiApiKey.trim());
      localStorage.setItem("toktrend_apify_token", apifyApiToken.trim());
      localStorage.setItem("toktrend_rapid_key", rapidApiKey.trim());
      triggerToast("Konfigurasi API Key berhasil disimpan di browser Anda!");
    } catch {
      triggerToast("Gagal menyimpan API Key.");
    }
  };

  const copyToClipboard = (text: string, msg: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    triggerToast(msg);
  };

  const bookmarkedProducts = products.filter((p) => p.bookmarked);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#090A0F] text-[#F3F4F6] transition-colors duration-200 ${
        uiMode === "wave"
          ? "theme-wave"
          : uiMode === "hoperise"
          ? "theme-hoperise"
          : "theme-dark"
      }`}
    >
      {/* Flash Sale Countdown Banner */}
      {siteConfig.flashSaleEnabled && !isProTier && (
        <div
          className={`px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs border-b ${
            uiMode === "hoperise"
              ? "bg-[#2A471E] text-white border-[#1F3616]"
              : uiMode === "wave"
              ? "bg-[#080916] text-white border-indigo-500/30"
              : "bg-[#0d1512] text-slate-100 border-emerald-500/30"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#00A8FF] text-white font-mono tabular-nums font-bold">
              ⏳ BERAKHIR DALAM {formatCountdown(flashCountdown)}
            </span>
            <span className="font-medium text-white">
              {siteConfig.flashSaleText}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 font-mono tabular-nums font-bold text-cyan-300">
              KODE: {siteConfig.promoCode} (Hemat{" "}
              {formatRupiah(siteConfig.promoDiscountIdr)})
            </span>
          </div>
          <button
            onClick={() => setActiveTab("referral")}
            className="px-3.5 py-1 rounded-full bg-white text-[#1A1917] font-bold hover:bg-slate-200 transition"
          >
            Klaim Diskon Pro →
          </button>
        </div>
      )}

      {/* Clean Minimalist Top Navigation Bar (Sticky on Mobile & Desktop) */}
      <header className="sticky top-0 z-30 bg-[#11131A]/95 backdrop-blur-md border-b border-[#1F2430] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Menu Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 shrink-0"
            aria-label="Menu Navigasi"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <svg
              width="22"
              height="18"
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
            <span className="font-bold tracking-tight text-sm truncate">
              {siteConfig.brandName}{" "}
              <span className={themeClasses.textAccent}>
                {siteConfig.brandHighlight}
              </span>
            </span>
          </div>
          <span className="hidden lg:inline-block text-slate-500">|</span>
          <span className="hidden lg:inline-block text-slate-400 truncate">
            {siteConfig.bannerText}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Clean Theme Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleUiMode("dark")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                uiMode !== "hoperise"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Gelap
            </button>
            <button
              type="button"
              onClick={() => handleToggleUiMode("hoperise")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                uiMode === "hoperise"
                  ? "bg-[#52833C] text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Terang
            </button>
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setIsMobileMenuOpen(false);
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-medium transition"
              >
                <span className="hidden sm:inline">Panel </span>Admin
              </button>

              <button
                onClick={() => {
                  setIsProTier((prev) => !prev);
                  setDetailQuotaUsed(1);
                  setPromptQuotaUsed(1);
                }}
                className="hidden md:inline-flex px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition font-medium"
              >
                Tier:{" "}
                <strong
                  className={`ml-1 ${
                    isProTier ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isProTier ? "PRO" : "FREE"}
                </strong>
              </button>
            </>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <div
                className={`w-5 h-5 rounded-full ${themeClasses.bgPrimary} text-white flex items-center justify-center font-bold text-[11px]`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="hidden sm:inline font-medium text-slate-200 hover:underline max-w-[100px] truncate"
              >
                {currentUser.name}
              </button>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 font-medium transition"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 font-medium transition"
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className={`hidden sm:inline-flex px-3.5 py-1.5 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white font-medium transition`}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 relative">
        {/* Clean Structured Sidebar Navigation (Slide-over on Mobile, Fixed Column on Desktop) */}
        <aside
          className={`${
            isMobileMenuOpen ? "flex" : "hidden lg:flex"
          } w-full lg:w-60 bg-[#11131A] border-b lg:border-b-0 lg:border-r border-[#1F2430] p-4 flex-col justify-between shrink-0 z-20`}
        >
          <div className="space-y-6">
            {/* Group 1: Riset & Analitik */}
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Analitik Pasar
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("trending");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "trending"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Produk Trending</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-black/20 font-mono tabular-nums">
                    {products.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("shops");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "shops"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Riset Toko</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("ondemand");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "ondemand"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Bedah Link TikTok</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("watchlist");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "watchlist"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Watchlist Saya</span>
                  {bookmarkedProducts.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-black/20 font-mono tabular-nums">
                      {bookmarkedProducts.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Group 2: Studio AI & Perencanaan */}
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Studio AI &amp; Kreator
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("flowstudio");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "flowstudio"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Google Flow Studio</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("hookstudio");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "hookstudio"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Hook &amp; Teleprompter</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("tiktoktracker");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "tiktoktracker"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Jam FYP &amp; Kalender</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("calculator");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "calculator"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Kalkulator ROI</span>
                </button>
              </nav>
            </div>

            {/* Group 3: Akun & Pengaturan */}
            <div>
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Akun
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("referral");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "referral"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Paket Pro &amp; Afiliasi</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === "settings"
                      ? `${themeClasses.bgPrimary} text-white`
                      : "text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <span>Pengaturan &amp; API</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab("admin");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      activeTab === "admin"
                        ? "bg-amber-600 text-white"
                        : "text-amber-400 hover:bg-slate-800/70"
                    }`}
                  >
                    <span>Manajemen CMS &amp; UI</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">
                      Admin
                    </span>
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Compact Quota Card */}
          <div className="mt-8 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-400">Status Akun</span>
              <span className="font-semibold text-emerald-400">
                {isProTier ? "Paket Pro" : "Paket Gratis"}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Kuota Prompt AI</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {isProTier
                    ? "Tanpa Batas"
                    : `${promptQuotaUsed}/${promptQuotaMax}`}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{
                    width: isProTier
                      ? "100%"
                      : `${Math.min(100, (promptQuotaUsed / promptQuotaMax) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {!isProTier && (
              <button
                onClick={() => {
                  setActiveTab("referral");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium transition"
              >
                Tingkatkan ke Pro
              </button>
            )}
          </div>
        </aside>

        {/* Main Workspace (Extra bottom padding on mobile for fixed bottom nav) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6 overflow-x-hidden">
          {/* TAB 1: TRENDING LEADERBOARD (CLEAN, CUSTOMIZABLE, & MOBILE-FIRST) */}
          {activeTab === "trending" && (
            <section className="space-y-5">
              {/* Optional Hero Banner (Controlled from Admin Panel) */}
              {siteConfig.showHeroBanner && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                      {siteConfig.brandName} {siteConfig.brandHighlight}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      {siteConfig.heroBannerTitle ||
                        "Riset Produk Viral & Studio Prompt Video AI"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {siteConfig.heroBannerSubtitle ||
                        "Analisis komisi, kecepatan penjualan 7 hari, dan buat skrip video TikTok dalam hitungan detik."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("flowstudio")}
                      className={`px-4 py-2.5 rounded-xl ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white text-xs font-semibold transition`}
                    >
                      {siteConfig.ctaButtonText || "Buka Studio Prompt AI"}
                    </button>
                  </div>
                </div>
              )}

              {/* Clean Executive Page Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-800/80">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {siteConfig.leaderboardTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {siteConfig.leaderboardSubtitle ||
                      "Pantau metrik penjualan 7 hari, temukan produk pendatang baru (Newcomer), dan buat prompt video AI."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setOnlyNewcomerBreakout((prev) => !prev)}
                    className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition ${
                      onlyNewcomerBreakout
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {onlyNewcomerBreakout
                      ? "Newcomer Aktif (<14h)"
                      : "Filter Newcomer (<14h)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("flowstudio")}
                    className={`px-3.5 py-2 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white text-xs font-semibold transition`}
                  >
                    {siteConfig.ctaButtonText || "Buka Studio Prompt AI"}
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("admin")}
                      className="px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition"
                    >
                      Edit UI &amp; Produk
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Clean Summary KPI Cards (Toggled via Admin Panel) */}
              {(siteConfig.showKpiCards ?? true) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Total Produk Terpantau
                    </p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums">
                        {products.length} SKU
                      </p>
                      <span className="text-xs text-emerald-400 font-medium">
                        Data 7 Hari Terakhir
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Total Estimasi GMV (7 Hari)
                    </p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums">
                        {formatShortRupiah(
                          products.reduce((acc, item) => acc + item.gmv7d, 0)
                        )}
                      </p>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        Rata-rata +
                        {Math.round(
                          products.reduce(
                            (acc, item) => acc + item.growth7d,
                            0
                          ) / Math.max(1, products.length)
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <p className="text-xs font-medium text-slate-400">
                      Produk Newcomer (&lt;14 Hari)
                    </p>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums">
                        {
                          products.filter((item) => item.isNewcomerBreakout)
                            .length
                        }{" "}
                        Produk
                      </p>
                      <button
                        type="button"
                        onClick={() => setOnlyNewcomerBreakout((prev) => !prev)}
                        className="text-xs text-emerald-400 hover:underline font-medium"
                      >
                        {onlyNewcomerBreakout
                          ? "Tampilkan Semua"
                          : "Lihat Daftar →"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Category Pills (Scrollable Horizontally on Mobile, Toggled via Admin) */}
              {(siteConfig.showCategoryPills ?? true) && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { label: "Semua Kategori", val: "ALL" },
                    { label: "Beauty & Care", val: "Beauty & Care" },
                    { label: "Home & Living", val: "Home & Living" },
                    { label: "Gadget & Aksesoris", val: "Gadget & Aksesoris" },
                    { label: "Fashion & Muslim", val: "Fashion & Muslim" },
                  ].map((cat) => (
                    <button
                      key={cat.val}
                      type="button"
                      onClick={() => setCategory(cat.val)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                        category === cat.val
                          ? `${themeClasses.bgPrimary} text-white`
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Streamlined Search & Filter Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-2 lg:col-span-5">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Pencarian Produk atau Toko
                  </label>
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    type="text"
                    placeholder="Cari nama produk, kategori, atau nama toko..."
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="Beauty & Care">Beauty &amp; Care</option>
                    <option value="Home & Living">Home &amp; Living</option>
                    <option value="Gadget & Aksesoris">
                      Gadget &amp; Aksesoris
                    </option>
                    <option value="Fashion & Muslim">Fashion &amp; Muslim</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Minimal Komisi
                  </label>
                  <select
                    value={minCommission}
                    onChange={(e) => setMinCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  >
                    <option value={0}>Semua Komisi</option>
                    <option value={10}>Minimal 10%</option>
                    <option value={15}>Minimal 15%</option>
                    <option value={20}>Minimal 20%</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                          | "growth"
                          | "sold"
                          | "gmv"
                          | "commission"
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  >
                    <option value="growth">Pertumbuhan 7 Hari</option>
                    <option value="sold">Unit Terjual</option>
                    <option value="gmv">Estimasi GMV</option>
                    <option value="commission">Komisi Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* MOBILE PRODUCT VIEW (< md): Touch-Friendly Cards or Compact List */}
              <div className="md:hidden space-y-3">
                {filteredProducts.map((p, idx) =>
                  siteConfig.mobileLayoutMode === "compact" ? (
                    /* Compact Mobile List Item */
                    <div
                      key={`mob-compact-${p.id}`}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() => handleOpenProductDetail(p)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        {renderProductThumb(p, "w-12 h-12 text-base")}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs leading-snug truncate">
                            #{idx + 1} {p.title}
                          </p>
                          <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                            {formatRupiah(p.price)} • Komisi {p.commissionRate}%
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.sold7d.toLocaleString("id-ID")} terjual (+
                            {p.growth7d}%)
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenFlowWithProduct(p)}
                          className={`px-3 py-1.5 rounded-lg ${themeClasses.bgPrimary} text-white text-[11px] font-semibold`}
                        >
                          Prompt AI
                        </button>
                        <button
                          onClick={() => handleOpenProductDetail(p)}
                          className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Full Mobile Product Card (Default) */
                    <div
                      key={`mob-card-${p.id}`}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5"
                    >
                      <div className="flex items-start gap-3">
                        {renderProductThumb(p, "w-14 h-14 text-lg")}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-slate-400">
                              Peringkat #{idx + 1}
                            </span>
                            {p.isNewcomerBreakout && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                                Newcomer ({p.daysListed}h)
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm leading-snug mt-0.5">
                            {p.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {p.shopName} • {p.category}
                          </p>
                        </div>
                      </div>

                      {/* 3-Column Mobile Metrics Grid */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono tabular-nums">
                        <div>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Harga &amp; Komisi
                          </p>
                          <p className="font-semibold mt-0.5">
                            {formatRupiah(p.price)}
                          </p>
                          <p className="text-[11px] text-emerald-400">
                            {p.commissionRate}% ({formatRupiah(p.commissionAmount)})
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Terjual (7h)
                          </p>
                          <p className="font-semibold mt-0.5">
                            {p.sold7d.toLocaleString("id-ID")}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ~{Math.round(p.sold7d / 7)}/hari
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-sans">
                            Tren &amp; GMV
                          </p>
                          <p className="font-semibold text-emerald-400 mt-0.5">
                            +{p.growth7d}%
                          </p>
                          <p className="text-[11px] text-slate-300">
                            {formatShortRupiah(p.gmv7d)}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Touch Action Buttons */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          onClick={() => handleToggleBookmark(p.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition ${
                            p.bookmarked
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                              : "border-slate-800 bg-slate-950 text-slate-300"
                          }`}
                        >
                          {p.bookmarked ? "Tersimpan" : "Simpan"}
                        </button>
                        <button
                          onClick={() => handleOpenProductDetail(p)}
                          className="flex-1 py-2 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs font-medium text-center"
                        >
                          Detail Video
                        </button>
                        <button
                          onClick={() => handleOpenFlowWithProduct(p)}
                          className={`flex-1 py-2 px-3 rounded-lg ${themeClasses.bgPrimary} text-white text-xs font-semibold text-center`}
                        >
                          Buat Prompt
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsCreatingNewProduct(false);
                              setEditingProduct(p);
                              setActiveTab("admin");
                            }}
                            className="px-2.5 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* DESKTOP LEADERBOARD TABLE (hidden on mobile, visible on md+) */}
              <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-5 w-12">#</th>
                        <th className="py-3.5 px-5">Produk &amp; Toko</th>
                        <th className="py-3.5 px-5">Harga &amp; Komisi</th>
                        <th className="py-3.5 px-5">Volume (7 Hari)</th>
                        <th className="py-3.5 px-5">Pertumbuhan</th>
                        <th className="py-3.5 px-5">Estimasi GMV</th>
                        <th className="py-3.5 px-5 text-right">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-sm">
                      {filteredProducts.map((p, idx) => {
                        const cellPad =
                          siteConfig.tableDensity === "compact"
                            ? "py-2.5 px-4"
                            : "py-4 px-5";
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-800/30 transition"
                          >
                            <td
                              className={`${cellPad} font-mono tabular-nums text-xs text-slate-500`}
                            >
                              {idx + 1}
                            </td>
                            <td className={`${cellPad} max-w-md`}>
                              <div className="flex items-center gap-3.5">
                                {renderProductThumb(p, "w-12 h-12 text-lg")}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm leading-snug truncate">
                                      {p.title}
                                    </p>
                                    {p.isNewcomerBreakout && (
                                      <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[11px] font-medium">
                                        Newcomer ({p.daysListed}h)
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                                    <span>{p.shopName}</span>
                                    <span>•</span>
                                    <span>{p.category}</span>
                                    <span>•</span>
                                    <span>
                                      {p.activeCreatorsCount} kreator aktif
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td
                              className={`${cellPad} font-mono tabular-nums`}
                            >
                              <p className="font-medium">
                                {formatRupiah(p.price)}
                              </p>
                              <p className="text-xs text-emerald-400 mt-0.5">
                                Komisi {p.commissionRate}% (
                                {formatRupiah(p.commissionAmount)})
                              </p>
                            </td>
                            <td
                              className={`${cellPad} font-mono tabular-nums`}
                            >
                              <p className="font-medium">
                                {p.sold7d.toLocaleString("id-ID")} terjual
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                ~
                                {Math.round(p.sold7d / 7).toLocaleString(
                                  "id-ID"
                                )}
                                /hari
                              </p>
                            </td>
                            <td
                              className={`${cellPad} font-mono tabular-nums`}
                            >
                              <span className="inline-block px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                                +{p.growth7d}%
                              </span>
                            </td>
                            <td
                              className={`${cellPad} font-mono tabular-nums font-semibold`}
                            >
                              {formatShortRupiah(p.gmv7d)}
                            </td>
                            <td className={`${cellPad} text-right`}>
                              <div className="flex items-center justify-end gap-2">
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setIsCreatingNewProduct(false);
                                      setEditingProduct(p);
                                      setActiveTab("admin");
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-medium hover:bg-amber-500/20"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleBookmark(p.id)}
                                  title="Simpan ke Watchlist"
                                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                                    p.bookmarked
                                      ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                      : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800"
                                  }`}
                                >
                                  {p.bookmarked ? "Tersimpan" : "Simpan"}
                                </button>
                                <button
                                  onClick={() => handleOpenProductDetail(p)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs font-medium hover:bg-slate-800 transition"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() => handleOpenFlowWithProduct(p)}
                                  className={`px-3 py-1.5 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white text-xs font-medium transition`}
                                >
                                  Buat Prompt
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB NEW: TIKTOK CONNECT, 24H PEAK TRAFFIC, 6-MONTH STREAK & REMINDER */}
          {activeTab === "tiktoktracker" && (
            <TikTokTrackerAndPlanner
              products={products}
              onTriggerToast={triggerToast}
              onOpenFlowWithProduct={handleOpenFlowWithProduct}
            />
          )}

          {/* TAB NEW: UPGRADE PRO VIA WHATSAPP & REFERRAL 30% */}
          {activeTab === "referral" && (
            <ReferralAndCheckoutSection
              proPriceMonthly={siteConfig.proPriceMonthly}
              adminPromoCode={siteConfig.promoCode}
              adminPromoDiscount={siteConfig.promoDiscountIdr}
              adminWhatsapp={siteConfig.adminWhatsapp}
              currentUserName={currentUser?.name || ""}
              currentUserEmail={currentUser?.email || ""}
              isProTier={isProTier}
              onActivatePro={() => setIsProTier(true)}
              onTriggerToast={triggerToast}
            />
          )}

          {/* TAB ADMIN CMS (PIN PROTECTED, CSV, USERS, VIDEOS, APPEARANCE) - EXCLUSIVE TO OWNER ADMIN */}
          {activeTab === "admin" && isAdmin && (
            <AdminCmsPanel
              products={products}
              siteConfig={siteConfig}
              uiMode={uiMode}
              onChangeUiMode={handleToggleUiMode}
              editingProduct={editingProduct}
              isCreatingNewProduct={isCreatingNewProduct}
              onSetEditingProduct={setEditingProduct}
              onSetIsCreatingNewProduct={setIsCreatingNewProduct}
              onSaveProducts={saveProductsToStorage}
              onSaveSiteConfig={saveSiteConfigToStorage}
              onResetDefaults={handleResetAdminDefaults}
              onTriggerToast={triggerToast}
              renderProductThumb={renderProductThumb}
            />
          )}

          {/* TAB 2: ON-DEMAND TIKTOK LINK ANALYZER */}
          {activeTab === "ondemand" && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">
                  🔗 Bedah Link Produk TikTok Shop (On-Demand)
                </h2>
                <p className="text-sm text-slate-400">
                  Tempel link produk TikTok untuk mengekstrak estimasi komisi,
                  kecepatan penjualan 7 hari, dan langsung membuat prompt Google
                  Flow.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <label className="block text-sm font-semibold">
                  URL Produk TikTok Shop
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    type="text"
                    placeholder="https://vt.tiktok.com/..."
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  />
                  <button
                    onClick={handleRunOnDemandScrape}
                    disabled={isScraping}
                    className={`px-5 py-2.5 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} disabled:opacity-50 text-white text-sm font-semibold shrink-0`}
                  >
                    {isScraping
                      ? "⏳ Menganalisis Link..."
                      : "🔍 Tarik Data & Analisis"}
                  </button>
                </div>

                {scrapeError && (
                  <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    ⚠️ {scrapeError}
                  </div>
                )}

                {scrapedProduct && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3.5">
                        {renderProductThumb(
                          scrapedProduct,
                          "w-14 h-14 text-2xl"
                        )}
                        <div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
                            Skor Potensi Winning: {winningScore}/100
                          </span>
                          <h3 className="font-bold text-base mt-1">
                            {scrapedProduct.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Toko: <strong>{scrapedProduct.shopName}</strong> (⭐{" "}
                            {scrapedProduct.shopRating})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenFlowWithProduct(scrapedProduct)}
                        className={`px-4 py-2 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white text-xs font-semibold`}
                      >
                        🎬 Buka di Google Flow Studio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 3: GOOGLE FLOW AI STUDIO + IMAGE UPLOAD + STORYBOARD */}
          {activeTab === "flowstudio" && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    🎬 Google Flow AI Video Prompt, Ingredients &amp; Storyboard
                  </h2>
                  <p className="text-sm text-slate-400">
                    Unggah foto produk untuk ekstraksi visual otomatis, salin
                    Scene Prompt 9:16, dan ikuti panduan Storyboard Cut-to-Cut.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("hookstudio")}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold self-start"
                >
                  🎙️ Buka 10 Hook &amp; Teleprompter VO →
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    1. Pilih Produk Target
                  </label>
                  <select
                    value={selectedFlowProductId}
                    onChange={(e) => setSelectedFlowProductId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.title} (Komisi {p.commissionRate}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    2. Gaya Storytelling Video
                  </label>
                  <select
                    value={selectedFlowStyle}
                    onChange={(e) =>
                      setSelectedFlowStyle(e.target.value as FlowStyle)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  >
                    <option value="problem_solution">
                      🔥 Problem-Solution Hook (Konversi Tertinggi)
                    </option>
                    <option value="aesthetic_broll">
                      ✨ Aesthetic Faceless B-Roll / ASMR
                    </option>
                    <option value="luxury_cinematic">
                      🎥 Cinematic Macro Product Showcase
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    3. Catatan Visual Tambahan (Subject Lock)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={customVisualNote}
                      onChange={(e) => setCustomVisualNote(e.target.value)}
                      type="text"
                      placeholder="Misal: botol kaca pink pastel..."
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                    <button
                      onClick={handleGenerateFlowAPI}
                      className={`px-4 py-2 rounded-lg ${themeClasses.bgPrimary} ${themeClasses.bgPrimaryHover} text-white text-xs font-semibold shrink-0`}
                    >
                      ✨ Simpan &amp; Generate
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="space-y-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">
                        📸 Upload Foto Produk (Flow Ingredients)
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        Auto-Extract
                      </span>
                    </div>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950 cursor-pointer transition text-center">
                      {uploadedImagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={uploadedImagePreview}
                            alt="Uploaded Ingredient Preview"
                            className="w-28 h-28 object-contain mx-auto rounded-lg border border-slate-800 bg-white/5 p-1"
                          />
                          <p className="text-xs font-semibold text-emerald-400">
                            ✅ {uploadedImageName}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2">
                          <p className="text-2xl">📤</p>
                          <p className="text-xs font-semibold text-slate-200">
                            Klik untuk Upload Gambar Produk (PNG/JPG)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-semibold text-slate-400">
                        Subject Lock Keywords Aktif:
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {flowPackage.ingredientSpec.subjectLocks.map(
                          (lock, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded bg-slate-950 border border-slate-800"
                            >
                              {lock}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">
                        #️⃣ Rekomendasi Hashtag TikTok
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            flowPackage.hashtags.combinedString,
                            "Semua hashtag berhasil disalin!"
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 font-semibold transition"
                      >
                        📋 Copy Semua
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono leading-relaxed select-all">
                      {flowPackage.hashtags.combinedString}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-5">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-base">
                        🎞️ Scene-by-Scene Prompt untuk Google Flow
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            flowPackage.scenes
                              .map((s) => `${s.title}\n${s.prompt}`)
                              .join("\n\n"),
                            "Seluruh 3 adegan prompt Google Flow berhasil disalin!"
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-xs font-semibold transition"
                      >
                        📋 Salin Semua Adegan
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {flowPackage.scenes.map((scene) => (
                        <div
                          key={scene.sceneNumber}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span
                                className={`text-xs font-bold ${themeClasses.textAccent}`}
                              >
                                {scene.title}
                              </span>
                              <span className="text-xs text-slate-400 ml-2">
                                • 🎥 {scene.cameraMovement}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  scene.prompt,
                                  `Prompt Adegan ${scene.sceneNumber} disalin!`
                                )
                              }
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-semibold hover:bg-indigo-600 transition"
                            >
                              📋 Copy Prompt Adegan {scene.sceneNumber}
                            </button>
                          </div>
                          <p className="text-xs font-mono leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800 select-all">
                            {scene.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-base">
                      ✂️ Storyboard Visual 3-Panel &amp; Panduan Edit Cut-to-Cut
                      (CapCut Ready)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {flowPackage.storyboardPanels.map((panel) => (
                        <div
                          key={panel.panelNumber}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 font-bold">
                              Panel #{panel.panelNumber}
                            </span>
                            <span className="font-mono text-slate-400">
                              {panel.timestamp}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-100">
                            {panel.visualSummary}
                          </p>
                          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <p className="text-slate-400">Teks Layar:</p>
                            <p className="font-bold text-emerald-400">
                              {panel.onScreenText}
                            </p>
                          </div>
                          <div className="space-y-1 text-slate-300">
                            <p>
                              <strong>Transisi:</strong>{" "}
                              {panel.capcutTransition}
                            </p>
                            <p>
                              <strong>SFX:</strong> {panel.sfxCue}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: AI HOOK & SCRIPT TELEPROMPTER STUDIO */}
          {activeTab === "hookstudio" && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    🎙️ AI Hook 3 Detik Pertama &amp; Voiceover Teleprompter
                    Studio
                  </h2>
                </div>
                <select
                  value={selectedFlowProductId}
                  onChange={(e) => setSelectedFlowProductId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                        🔴 LAYAR TELEPROMPTER REKAM VO
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            teleprompterText,
                            "Naskah Teleprompter disalin!"
                          )
                        }
                        className="text-xs underline text-slate-300"
                      >
                        📋 Copy Naskah
                      </button>
                    </div>
                    <div
                      ref={teleprompterBoxRef}
                      className="h-72 overflow-y-auto p-5 rounded-xl bg-black border-2 border-slate-800 leading-relaxed font-semibold text-white select-all"
                      style={{ fontSize: `${teleprompterFontSize}px` }}
                    >
                      {teleprompterText}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Kecepatan Gulir: {teleprompterSpeed}x
                        </label>
                        <input
                          type="range"
                          min={1}
                          max={6}
                          value={teleprompterSpeed}
                          onChange={(e) =>
                            setTeleprompterSpeed(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">
                          Ukuran Teks: {teleprompterFontSize}px
                        </label>
                        <input
                          type="range"
                          min={16}
                          max={34}
                          value={teleprompterFontSize}
                          onChange={(e) =>
                            setTeleprompterFontSize(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setIsTeleprompterPlaying((prev) => !prev)
                        }
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${
                          isTeleprompterPlaying
                            ? "bg-amber-600 text-white"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        {isTeleprompterPlaying
                          ? "⏸️ Jeda Teleprompter"
                          : "▶️ Mulai Gulir Otomatis"}
                      </button>
                      <button
                        onClick={() => {
                          setIsTeleprompterPlaying(false);
                          if (teleprompterBoxRef.current) {
                            teleprompterBoxRef.current.scrollTop = 0;
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 max-h-[540px] overflow-y-auto">
                  <h3 className="font-bold text-base">
                    ⚡ 10 Formula Hook 3 Detik Pertama
                  </h3>
                  <div className="space-y-2.5">
                    {flowPackage.hookFormulas.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setTeleprompterText(item.fullTeleprompterScript);
                          if (teleprompterBoxRef.current) {
                            teleprompterBoxRef.current.scrollTop = 0;
                          }
                          triggerToast(
                            `Hook #${item.id} dimuat ke layar Teleprompter!`
                          );
                        }}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-bold ${themeClasses.textAccent}`}
                          >
                            #{item.id} • {item.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                            Pakai di Teleprompter →
                          </span>
                        </div>
                        <p className="font-bold text-sm text-white">
                          &ldquo;{item.hookText}&rdquo;
                        </p>
                        <p className="text-xs text-emerald-400">
                          💡 Tip Visual: {item.conversionTip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: KALKULATOR CUAN & ROI AFFILIATE */}
          {activeTab === "calculator" && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">
                  🧮 Kalkulator Target Cuan Affiliate &amp; Simulasi ROI Iklan
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Pilih Produk
                    </label>
                    <select
                      value={calcProductId}
                      onChange={(e) => setCalcProductId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.title} (Komisi{" "}
                          {formatRupiah(p.commissionAmount)}/pcs)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Target Komisi Kotor Bulanan (Rp)
                    </label>
                    <input
                      type="number"
                      step={500000}
                      value={targetMonthlyIncome}
                      onChange={(e) =>
                        setTargetMonthlyIncome(Number(e.target.value))
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        CTR Klik Keranjang (%)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={estimatedCtrPercent}
                        onChange={(e) =>
                          setEstimatedCtrPercent(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Rasio Checkout CVR (%)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={estimatedCvrPercent}
                        onChange={(e) =>
                          setEstimatedCvrPercent(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Simulasi Budget Iklan Harian / GMV Max (Rp)
                    </label>
                    <input
                      type="number"
                      step={10000}
                      value={dailyAdSpend}
                      onChange={(e) => setDailyAdSpend(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-base border-b border-slate-800 pb-3">
                    📈 Peta Jalan Mencapai{" "}
                    <span className="text-emerald-400">
                      {formatRupiah(targetMonthlyIncome)} / Bulan
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-xs text-slate-400">
                        Target Penjualan Harian
                      </p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">
                        {calcMetrics.unitsNeededDaily} pcs / hari
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Total{" "}
                        {calcMetrics.unitsNeededMonthly.toLocaleString("id-ID")}{" "}
                        pcs / bulan
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-xs text-slate-400">
                        Target Views Video Bulanan
                      </p>
                      <p className="text-2xl font-bold text-indigo-400 mt-1">
                        {calcMetrics.viewsNeededMonthly.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        ~
                        {calcMetrics.clicksNeededMonthly.toLocaleString(
                          "id-ID"
                        )}{" "}
                        klik keranjang
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="text-xs text-slate-400">
                        Profit Bersih (Setelah Iklan)
                      </p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          calcMetrics.netMonthlyProfit >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {formatShortRupiah(calcMetrics.netMonthlyProfit)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Iklan: {formatShortRupiah(calcMetrics.monthlyAdCost)}
                        /bln
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: SHOPS */}
          {activeTab === "shops" && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">
                  🏪 Analisis Toko &amp; Kompetitor Teratas
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s.category}
                        </span>
                        <h3 className="font-bold text-base mt-1">{s.name}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold">
                        ⭐ {s.rating}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                      <div>
                        <p className="text-slate-400">GMV 30 Hari</p>
                        <p className="font-bold text-sm mt-0.5">{s.gmv30d}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Rata-rata Komisi</p>
                        <p className="font-bold text-sm text-emerald-400 mt-0.5">
                          {s.avgCommission}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Produk Aktif</p>
                        <p className="font-bold text-sm mt-0.5">
                          {s.activeProducts} SKU
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 7: WATCHLIST */}
          {activeTab === "watchlist" && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">
                  ⭐ Watchlist Produk &amp; Pantauan Komisi
                </h2>
              </div>
              {bookmarkedProducts.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <p className="text-sm font-semibold">
                    Watchlist Anda masih kosong
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {renderProductThumb(p, "w-11 h-11 text-2xl")}
                          <div>
                            <span className="text-xs font-semibold text-emerald-400">
                              {p.statusNote}
                            </span>
                            <h3 className="font-bold text-sm mt-0.5">
                              {p.title}
                            </h3>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleBookmark(p.id)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => handleOpenProductDetail(p)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold"
                        >
                          📊 Detail Video
                        </button>
                        <button
                          onClick={() => handleOpenFlowWithProduct(p)}
                          className={`px-3 py-1.5 rounded-lg ${themeClasses.bgPrimary} text-white text-xs font-semibold`}
                        >
                          🎬 Buat Prompt Flow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB 8: PROFIL AKUN, RIWAYAT PROMPT & PENGATURAN API KEY */}
          {activeTab === "settings" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">
                  ⚙️ Profil Akun, Riwayat Prompt &amp; Pengaturan API Key
                  Pribadi
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-base">👤 Status Akun Anda</h3>
                  {currentUser ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-sm">
                      <p>
                        <span className="text-slate-400">Nama Kreator:</span>{" "}
                        <strong>{currentUser.name}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Email:</span>{" "}
                        <strong>{currentUser.email}</strong>
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={handleLogout}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-semibold"
                        >
                          Keluar dari Akun
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-sm">
                      <p className="text-slate-400">
                        Anda saat ini menggunakan mode tamu.
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href="/login"
                          className="px-4 py-2 rounded-full bg-[#4F46E5] text-white text-xs font-semibold"
                        >
                          🔐 Buka Halaman Login
                        </Link>
                        <Link
                          href="/login"
                          className={`px-4 py-2 rounded-full ${themeClasses.bgPrimary} text-white text-xs font-semibold`}
                        >
                          ✨ Buat Akun Baru
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <h4 className="font-bold text-sm">
                      🕓 Riwayat Prompt Google Flow ({promptHistory.length})
                    </h4>
                    {promptHistory.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        Belum ada riwayat prompt yang disimpan.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {promptHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-200">
                                {item.productTitle}
                              </p>
                              <p className="text-slate-400">
                                Gaya: {item.style} • {item.createdAt}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setFlowPackage(item.result);
                                setActiveTab("flowstudio");
                              }}
                              className={`px-2.5 py-1.5 rounded ${themeClasses.bgPrimary} text-white font-semibold shrink-0`}
                            >
                              Buka
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={handleSaveApiKeys}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <h3 className="font-bold text-base">
                    🔑 Pengaturan API Key Eksternal
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Google Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Apify API Token
                    </label>
                    <input
                      type="password"
                      value={apifyApiToken}
                      onChange={(e) => setApifyApiToken(e.target.value)}
                      placeholder="apify_api_..."
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      RapidAPI TikTok Shop Key
                    </label>
                    <input
                      type="password"
                      value={rapidApiKey}
                      onChange={(e) => setRapidApiKey(e.target.value)}
                      placeholder="x-rapidapi-key..."
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl ${themeClasses.bgPrimary} text-white text-xs font-bold transition`}
                  >
                    💾 Simpan Konfigurasi API Key
                  </button>
                </form>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                {renderProductThumb(selectedProductModal, "w-14 h-14 text-3xl")}
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedProductModal.category}
                  </span>
                  <h3 className="text-lg font-bold mt-1">
                    {selectedProductModal.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toko: {selectedProductModal.shopName} (⭐{" "}
                    {selectedProductModal.shopRating})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm">
                  🎥 Video Kreator Penggerak Omzet Teratas
                </h4>
                <div className="space-y-2.5">
                  {selectedProductModal.topVideos.map((v, i) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-bold ${themeClasses.textAccent}`}
                        >
                          #{i + 1} {v.creator}
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          Est. Terjual: {v.sales} ({v.views} views)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        &ldquo;{v.hook}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm">
                  👩‍💻 Affiliator / Kreator Teratas
                </h4>
                <div className="space-y-2.5">
                  {selectedProductModal.topCreators.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-sm">{c.username}</p>
                        <p className="text-slate-400">
                          {c.followers} Followers • {c.videosCount} Video Aktif
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400">Kontribusi GMV</p>
                        <p className="font-bold text-emerald-400 text-sm">
                          {c.estSales}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const prod = selectedProductModal;
                  setSelectedProductModal(null);
                  handleOpenFlowWithProduct(prod);
                }}
                className={`px-4 py-2 rounded-lg ${themeClasses.bgPrimary} text-white text-xs font-semibold`}
              >
                🎬 Buat Prompt Google Flow untuk Produk Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal (Direct WhatsApp Contact) */}
      {showPaywallModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold">
                BATAS KUOTA HARIAN FREE TIER
              </span>
              <button
                onClick={() => setShowPaywallModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Tutup
              </button>
            </div>
            <h3 className="text-lg font-bold">
              Upgrade ke {siteConfig.brandName} Pro untuk Riset Tanpa Batas
            </h3>
            <p className="text-xs text-slate-400">
              Untuk mengaktifkan Paket Pro tanpa batas kuota harian, silakan
              hubungi Admin kami langsung melalui WhatsApp.
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Harga Langganan</p>
                <p className="text-xl font-bold">
                  {formatRupiah(siteConfig.proPriceMonthly)}{" "}
                  <span className="text-xs font-normal">/ bulan</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaywallModal(false);
                  setActiveTab("referral");
                }}
                className={`px-4 py-2.5 rounded-lg ${themeClasses.bgPrimary} text-white text-xs font-semibold`}
              >
                💬 Hubungi Admin di WA →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login & Registration Modal (With Gmail OTP Verification) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold">
                  {authMode === "login"
                    ? "Masuk ke Akun"
                    : "Buat Akun Baru (Verifikasi Gmail)"}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setAuthOtpInfo(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authMode === "login"
                    ? `${themeClasses.bgPrimary} text-white`
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                  setAuthOtpInfo(null);
                }}
                className={`py-2 rounded-lg transition ${
                  authMode === "register"
                    ? `${themeClasses.bgPrimary} text-white`
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Daftar Akun (Gmail)
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            {authOtpInfo && authMode === "register" && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                {authOtpInfo}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-sm">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Nama Lengkap / Nama Kreator
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Contoh: Rina Affiliate"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {authMode === "register"
                    ? "Alamat Email Gmail (@gmail.com)"
                    : "Alamat Email"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={
                      authMode === "register"
                        ? "namaanda@gmail.com"
                        : "nama@email.com"
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                  />
                  {authMode === "register" && (
                    <button
                      type="button"
                      disabled={authOtpSending}
                      onClick={handleRequestModalGmailOtp}
                      className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold shrink-0"
                    >
                      {authOtpSending ? "Mengirim..." : "Minta Kode"}
                    </button>
                  )}
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Kode Verifikasi OTP dari Gmail (6 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={authOtpCode}
                    onChange={(e) =>
                      setAuthOtpCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Masukkan 6 digit kode verifikasi"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono tracking-widest text-center text-base"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-2.5 rounded-lg ${themeClasses.bgPrimary} text-white font-semibold text-sm transition`}
              >
                {authLoading
                  ? "Memproses..."
                  : authMode === "login"
                  ? "Masuk Sekarang"
                  : "Verifikasi & Buat Akun"}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={authLoading}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Masuk Instan dengan Akun Demo (creator@toktrend.id)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar (< lg) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#11131A]/95 backdrop-blur-md border-t border-[#1F2430] px-2 py-1.5 grid grid-cols-5 gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("trending");
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg font-medium transition ${
            activeTab === "trending"
              ? "text-emerald-400 bg-slate-800/70 font-semibold"
              : "text-slate-400"
          }`}
        >
          <span>Produk</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("flowstudio");
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg font-medium transition ${
            activeTab === "flowstudio"
              ? "text-emerald-400 bg-slate-800/70 font-semibold"
              : "text-slate-400"
          }`}
        >
          <span>Prompt AI</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("hookstudio");
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg font-medium transition ${
            activeTab === "hookstudio"
              ? "text-emerald-400 bg-slate-800/70 font-semibold"
              : "text-slate-400"
          }`}
        >
          <span>Hook</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("tiktoktracker");
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg font-medium transition ${
            activeTab === "tiktoktracker"
              ? "text-emerald-400 bg-slate-800/70 font-semibold"
              : "text-slate-400"
          }`}
        >
          <span>Jam FYP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isAdmin) {
              setActiveTab("admin");
              setIsMobileMenuOpen(false);
            } else {
              setIsMobileMenuOpen((prev) => !prev);
            }
          }}
          className={`flex flex-col items-center justify-center py-1.5 rounded-lg font-medium transition ${
            activeTab === "admin" || isMobileMenuOpen
              ? "text-amber-400 bg-slate-800/70 font-semibold"
              : "text-slate-400"
          }`}
        >
          <span>{isAdmin ? "Admin UI" : "Menu"}</span>
        </button>
      </nav>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-5 right-4 lg:right-5 bg-white text-slate-950 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
