export interface TopVideoItem {
  id: string;
  creator: string;
  views: string;
  likes: string;
  sales: string;
  hook: string;
  videoUrl: string;
}

export interface TopCreatorItem {
  id: string;
  username: string;
  followers: string;
  videosCount: number;
  estSales: string;
}

export interface ProductItem {
  id: string;
  shopId: string;
  icon: string;
  imageUrl?: string;
  title: string;
  shopName: string;
  shopRating: number;
  category: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  sold7d: number;
  growth7d: number;
  gmv7d: number;
  daysListed: number;
  activeCreatorsCount: number;
  isNewcomerBreakout: boolean;
  sparkline: number[];
  bookmarked: boolean;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  statusNote: string;
  visualLocks: string[];
  hashtags: {
    niche: string[];
    product: string[];
    affiliate: string[];
  };
  topVideos: TopVideoItem[];
  topCreators: TopCreatorItem[];
}

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  activeProducts: number;
  gmv30d: string;
  gmv30dNumeric: number;
  avgCommission: number;
  heroProduct: string;
  fulfillmentSla: string;
  bookmarked?: boolean;
}

export const INITIAL_SHOPS: ShopItem[] = [
  {
    id: "shop-glowlab",
    name: "GlowLab Official ID",
    category: "Beauty & Care",
    rating: 4.9,
    activeProducts: 38,
    gmv30d: "Rp 4,8 Miliar",
    gmv30dNumeric: 4800000000,
    avgCommission: 16.5,
    heroProduct: "Moisture Glow Niacinamide 10% + Ceramide Barrier Gel 50gr",
    fulfillmentSla: "99.2% Dikirim < 24 Jam",
    bookmarked: true,
  },
  {
    id: "shop-rumahrapi",
    name: "RumahRapi Living",
    category: "Home & Living",
    rating: 4.8,
    activeProducts: 112,
    gmv30d: "Rp 3,9 Miliar",
    gmv30dNumeric: 3900000000,
    avgCommission: 15.0,
    heroProduct: "Alat Pel Lantai Spin Mop Otomatis Pisah Air Kotor & Bersih",
    fulfillmentSla: "97.8% Dikirim < 24 Jam",
    bookmarked: false,
  },
  {
    id: "shop-voltmax",
    name: "VoltMax Gadget Official",
    category: "Gadget & Aksesoris",
    rating: 4.9,
    activeProducts: 64,
    gmv30d: "Rp 3,1 Miliar",
    gmv30dNumeric: 3100000000,
    avgCommission: 12.5,
    heroProduct: "Powerbank Mini Built-in Cable 10000mAh Fast Charging 22.5W",
    fulfillmentSla: "98.9% Dikirim < 24 Jam",
    bookmarked: false,
  },
  {
    id: "shop-zahara",
    name: "Zahara Modest Wear",
    category: "Fashion & Muslim",
    rating: 4.8,
    activeProducts: 85,
    gmv30d: "Rp 3,4 Miliar",
    gmv30dNumeric: 3400000000,
    avgCommission: 20.0,
    heroProduct: "Pashmina Silk Crinkle Airflow Tanpa Setrika Anti Letoy",
    fulfillmentSla: "98.4% Dikirim < 24 Jam",
    bookmarked: false,
  },
  {
    id: "shop-scentmuse",
    name: "ScentMuse Parfumerie",
    category: "Beauty & Care",
    rating: 4.9,
    activeProducts: 19,
    gmv30d: "Rp 2,7 Miliar",
    gmv30dNumeric: 2700000000,
    avgCommission: 22.0,
    heroProduct: "Extrait de Parfum 50ml Aroma Vanilla Gourmand Tahan 12 Jam",
    fulfillmentSla: "99.5% Dikirim < 24 Jam",
    bookmarked: true,
  },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    shopId: "shop-glowlab",
    icon: "🧴",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
    title: "Moisture Glow Niacinamide 10% + Ceramide Barrier Gel 50gr",
    shopName: "GlowLab Official ID",
    shopRating: 4.9,
    category: "Beauty & Care",
    price: 68000,
    commissionRate: 18,
    commissionAmount: 12240,
    sold7d: 14850,
    growth7d: 345,
    gmv7d: 1009800000,
    daysListed: 9,
    activeCreatorsCount: 28,
    isNewcomerBreakout: true,
    sparkline: [25, 32, 45, 60, 85, 120, 165],
    bookmarked: true,
    status: "ACTIVE",
    statusNote: "🐣 Newcomer Breakout (9 Hari) +345% • Pesaing Masih Sedikit",
    visualLocks: [
      "Frosted pink glass jar 50g",
      "Dewy translucent water-gel texture",
      "Minimalist silver metallic lid",
      "Soft morning sunlight reflection",
    ],
    hashtags: {
      niche: ["#skincareviral", "#skinbarrier", "#glowingskinindonesia"],
      product: ["#pelembabwajah", "#niacinamidegel", "#ceramidemoisturizer", "#moisturizergel"],
      affiliate: ["#racuntiktok", "#tiktokshopindonesia", "#spillproduk", "#keranjangkuning"],
    },
    topVideos: [
      {
        id: "vid-101",
        creator: "@rani.skindiary",
        views: "1.4M",
        likes: "94.2K",
        sales: "4,210 pcs",
        hook: "Stop pakai moisturizer krim tebal kalau muka kamu gampang komedoan, lihat tekstur gel air ini...",
        videoUrl: "https://www.tiktok.com/@rani.skindiary/video/7390001",
      },
      {
        id: "vid-102",
        creator: "@dokterkulit.id",
        views: "890K",
        likes: "61.5K",
        sales: "2,890 pcs",
        hook: "Bedah ingredients moisturizer 60 ribuan yang lagi viral banget di FYP minggu ini...",
        videoUrl: "https://www.tiktok.com/@dokterkulit.id/video/7390002",
      },
      {
        id: "vid-103",
        creator: "@faceless_beautyhacks",
        views: "640K",
        likes: "42.1K",
        sales: "1,950 pcs",
        hook: "(ASMR Macro) Perbandingan kulit kusam vs glowing basah dalam 7 hari pemakaian rutin...",
        videoUrl: "https://www.tiktok.com/@faceless_beautyhacks/video/7390003",
      },
    ],
    topCreators: [
      { id: "cr-1", username: "@rani.skindiary", followers: "145K", videosCount: 6, estSales: "Rp 286 Jt" },
      { id: "cr-2", username: "@dokterkulit.id", followers: "510K", videosCount: 2, estSales: "Rp 196 Jt" },
      { id: "cr-3", username: "@faceless_beautyhacks", followers: "38K", videosCount: 11, estSales: "Rp 132 Jt" },
    ],
  },
  {
    id: "prod-5",
    shopId: "shop-scentmuse",
    icon: "🌸",
    imageUrl:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80",
    title: "Extrait de Parfum 50ml Aroma Vanilla Gourmand Tahan 12 Jam",
    shopName: "ScentMuse Parfumerie",
    shopRating: 4.9,
    category: "Beauty & Care",
    price: 129000,
    commissionRate: 22,
    commissionAmount: 28380,
    sold7d: 6450,
    growth7d: 410,
    gmv7d: 832050000,
    daysListed: 6,
    activeCreatorsCount: 19,
    isNewcomerBreakout: true,
    sparkline: [15, 22, 35, 55, 90, 135, 180],
    bookmarked: false,
    status: "ACTIVE",
    statusNote: "🐣 Newcomer 6 Hari • Komisi 22% (Rp 28.380/pcs) • Baru 19 Kreator!",
    visualLocks: [
      "Heavy minimalist square crystal perfume bottle 50ml",
      "Golden amber liquid inside",
      "Fine micro-mist spray particles backlit by golden hour sun",
      "Vanilla pods and white orchid petals on travertine stone",
    ],
    hashtags: {
      niche: ["#parfumviral", "#rekomendasiparfum", "#wangitahanlama"],
      product: ["#parfumvanilla", "#extraitdeparfum", "#parfumlokalterbaik"],
      affiliate: ["#racunparfum", "#fypindonesia", "#tiktokaffiliate"],
    },
    topVideos: [
      {
        id: "vid-501",
        creator: "@scent.story_ai",
        views: "950K",
        likes: "68K",
        sales: "2,400 pcs",
        hook: "(Visual AI Cinematic) Ilustrasi wangi kue vanilla hangat dicampur bunga mewah yang bikin orang nengok...",
        videoUrl: "https://www.tiktok.com/@scent.story_ai/video/7390008",
      },
    ],
    topCreators: [
      { id: "cr-8", username: "@scent.story_ai", followers: "62K", videosCount: 12, estSales: "Rp 309 Jt" },
    ],
  },
  {
    id: "prod-6",
    shopId: "shop-rumahrapi",
    icon: "☕",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80",
    title: "Tumbler Kopi Vacuum Insulated 600ml Layar Suhu LED Smart Touch",
    shopName: "RumahRapi Living",
    shopRating: 4.8,
    category: "Home & Living",
    price: 89000,
    commissionRate: 17,
    commissionAmount: 15130,
    sold7d: 5280,
    growth7d: 490,
    gmv7d: 469920000,
    daysListed: 5,
    activeCreatorsCount: 14,
    isNewcomerBreakout: true,
    sparkline: [8, 15, 29, 52, 88, 140, 210],
    bookmarked: false,
    status: "ACTIVE",
    statusNote: "🐣 Newcomer 5 Hari (+490%) • Hanya 14 Kreator Pesaing!",
    visualLocks: [
      "Matte cream stainless steel vacuum tumbler 600ml",
      "Glowing LED temperature touch lid showing 85°C",
      "Ice cubes and condensation droplets on cozy wooden cafe desk",
    ],
    hashtags: {
      niche: ["#tumblerviral", "#botolminumestetik", "#anakngantor"],
      product: ["#tumblerledsuhu", "#tumblertahanpanasdingin", "#tumblerkopi"],
      affiliate: ["#racuntiktok", "#barangunik", "#keranjangkuning"],
    },
    topVideos: [
      {
        id: "vid-601",
        creator: "@desksetup.id",
        views: "780K",
        likes: "51K",
        sales: "1,980 pcs",
        hook: "Taruh es batu dari jam 7 pagi sampai jam 9 malam masih utuh belum cair, plus tutupnya bisa cek suhu...",
        videoUrl: "https://www.tiktok.com/@desksetup.id/video/7390009",
      },
    ],
    topCreators: [
      { id: "cr-9", username: "@desksetup.id", followers: "94K", videosCount: 4, estSales: "Rp 176 Jt" },
    ],
  },
  {
    id: "prod-2",
    shopId: "shop-rumahrapi",
    icon: "🧹",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80",
    title: "Alat Pel Lantai Spin Mop Otomatis Pisah Air Kotor & Bersih",
    shopName: "RumahRapi Living",
    shopRating: 4.8,
    category: "Home & Living",
    price: 145000,
    commissionRate: 15,
    commissionAmount: 21750,
    sold7d: 9320,
    growth7d: 260,
    gmv7d: 1351400000,
    daysListed: 24,
    activeCreatorsCount: 86,
    isNewcomerBreakout: false,
    sparkline: [40, 48, 55, 70, 95, 130, 155],
    bookmarked: true,
    status: "ACTIVE",
    statusNote: "💎 Komisi Rp 21.750/pcs — Konversi Ibu Rumah Tangga Tinggi",
    visualLocks: [
      "White and warm-grey dual-chamber spin mop bucket",
      "Square microfiber mop pad",
      "Clear clean-water jet separation mechanism",
      "Bright modern ceramic tile floor",
    ],
    hashtags: {
      niche: ["#perabotrumah", "#beresrumah", "#homelivingindonesia"],
      product: ["#alatpelviral", "#spinmoppisahair", "#pelotomatis", "#alatkebersihanrumah"],
      affiliate: ["#racunperabot", "#ibutiktok", "#wajibpunya", "#keranjangkuning"],
    },
    topVideos: [
      {
        id: "vid-201",
        creator: "@rumah_minimalis_lia",
        views: "2.1M",
        likes: "138K",
        sales: "3,800 pcs",
        hook: "Sumpah nyesel baru tahu ada ember pel yang air kotornya gak pernah nyampur balik...",
        videoUrl: "https://www.tiktok.com/@rumah_minimalis_lia/video/7390004",
      },
      {
        id: "vid-202",
        creator: "@homehacks.daily",
        views: "920K",
        likes: "54K",
        sales: "2,100 pcs",
        hook: "Test tumpahin kecap manis + saus sambal di keramik putih, sekali lewat langsung keset...",
        videoUrl: "https://www.tiktok.com/@homehacks.daily/video/7390005",
      },
    ],
    topCreators: [
      { id: "cr-4", username: "@rumah_minimalis_lia", followers: "290K", videosCount: 8, estSales: "Rp 551 Jt" },
      { id: "cr-5", username: "@homehacks.daily", followers: "88K", videosCount: 14, estSales: "Rp 304 Jt" },
    ],
  },
  {
    id: "prod-3",
    shopId: "shop-voltmax",
    icon: "🔋",
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80",
    title: "Powerbank Mini Built-in Cable 10000mAh Fast Charging 22.5W LED",
    shopName: "VoltMax Gadget Official",
    shopRating: 4.9,
    category: "Gadget & Aksesoris",
    price: 119000,
    commissionRate: 12,
    commissionAmount: 14280,
    sold7d: 8140,
    growth7d: 195,
    gmv7d: 968660000,
    daysListed: 11,
    activeCreatorsCount: 34,
    isNewcomerBreakout: true,
    sparkline: [50, 52, 60, 68, 79, 92, 110],
    bookmarked: false,
    status: "ACTIVE",
    statusNote: "🐣 Newcomer 11 Hari — Tren Naik menjelang akhir pekan",
    visualLocks: [
      "Pocket-sized matte titanium black mini powerbank",
      "Digital LED battery percentage display",
      "Built-in braided Type-C & Lightning strap cables",
      "Sleek modern tech desk lighting",
    ],
    hashtags: {
      niche: ["#gadgetviral", "#aksesorishp", "#techreviewid"],
      product: ["#powerbankmini", "#powerbankfastcharging", "#powerbankkabelbawaan"],
      affiliate: ["#racungadget", "#fypindonesia", "#rekomendasigadget"],
    },
    topVideos: [
      {
        id: "vid-301",
        creator: "@gadgetin_saku",
        views: "1.1M",
        likes: "79K",
        sales: "2,900 pcs",
        hook: "Ukuran cuma segede bedak compact tapi bisa ngecas dari 10% ke 70% dalam 25 menit tanpa bawa kabel...",
        videoUrl: "https://www.tiktok.com/@gadgetin_saku/video/7390006",
      },
    ],
    topCreators: [
      { id: "cr-6", username: "@gadgetin_saku", followers: "175K", videosCount: 5, estSales: "Rp 345 Jt" },
    ],
  },
  {
    id: "prod-4",
    shopId: "shop-zahara",
    icon: "🧕",
    imageUrl:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
    title: "Pashmina Silk Crinkle Airflow Tanpa Setrika Anti Letoy",
    shopName: "Zahara Modest Wear",
    shopRating: 4.8,
    category: "Fashion & Muslim",
    price: 49000,
    commissionRate: 20,
    commissionAmount: 9800,
    sold7d: 18400,
    growth7d: 280,
    gmv7d: 901600000,
    daysListed: 31,
    activeCreatorsCount: 140,
    isNewcomerBreakout: false,
    sparkline: [60, 75, 90, 110, 140, 165, 195],
    bookmarked: false,
    status: "ACTIVE",
    statusNote: "🔥 Volume unit tertinggi minggu ini (18.4rb pcs)",
    visualLocks: [
      "Soft champagne textured crinkle silk pashmina shawl",
      "Fluid fabric drape in slow motion",
      "Subtle luxury sheen under warm studio light",
    ],
    hashtags: {
      niche: ["#ootdhijab", "#hijabstyle", "#fashionmuslim"],
      product: ["#pashminacrinkle", "#pashminatanpasetrika", "#hijabinstan"],
      affiliate: ["#racunoutfit", "#outfitkondangan", "#keranjangkuning"],
    },
    topVideos: [
      {
        id: "vid-401",
        creator: "@nabila.ootd",
        views: "1.8M",
        likes: "112K",
        sales: "6,400 pcs",
        hook: "Baru keluar dari mesin cuci langsung dipakai tanpa setrika sama sekali, lihat jatuhnya di wajah...",
        videoUrl: "https://www.tiktok.com/@nabila.ootd/video/7390007",
      },
    ],
    topCreators: [
      { id: "cr-7", username: "@nabila.ootd", followers: "420K", videosCount: 9, estSales: "Rp 313 Jt" },
    ],
  },
];
