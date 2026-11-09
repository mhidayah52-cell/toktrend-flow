import { ProductItem } from "./mock-data";

export type FlowStyle = "problem_solution" | "aesthetic_broll" | "luxury_cinematic";

export interface FlowScenePrompt {
  sceneNumber: number;
  title: string;
  duration: string;
  cameraMovement: string;
  prompt: string;
}

export interface StoryboardPanel {
  panelNumber: number;
  timestamp: string;
  visualSummary: string;
  capcutTransition: string;
  onScreenText: string;
  sfxCue: string;
}

export interface HookFormulaItem {
  id: number;
  category: string;
  hookText: string;
  fullTeleprompterScript: string;
  conversionTip: string;
}

export interface FlowGenerationResult {
  productId: string;
  productTitle: string;
  style: FlowStyle;
  ingredientSpec: {
    fileName: string;
    resolution: string;
    subjectLocks: string[];
    instruction: string;
  };
  scenes: FlowScenePrompt[];
  storyboardPanels: StoryboardPanel[];
  hookFormulas: HookFormulaItem[];
  voiceoverScript: string;
  hashtags: {
    niche: string[];
    product: string[];
    affiliate: string[];
    combinedString: string;
  };
}

export function generateHookFormulas(product: ProductItem): HookFormulaItem[] {
  const shortName = product.title.split(" ").slice(0, 4).join(" ");
  const priceRb = Math.round(product.price / 1000) + " ribuan";
  const soldText = product.sold7d.toLocaleString("id-ID");

  return [
    {
      id: 1,
      category: "🛑 Stop-Doing-This (Pattern Interrupt)",
      hookText: `Stop beli ${product.category.toLowerCase()} mahal kalau kamu belum lihat cara kerja ${shortName} ini!`,
      fullTeleprompterScript: `Stop beli ${product.category.toLowerCase()} mahal kalau kamu belum lihat cara kerja ${shortName} ini! Jujur awalnya aku ragu karena harganya cuma ${priceRb}. Tapi begitu dipakai, detail dan hasilnya beneran di luar ekspektasi. Pantas saja sudah terjual lebih dari ${soldText} pcs minggu ini. Cek keranjang kuning di pojok kiri bawah sebelum stok promonya habis!`,
      conversionTip: "Tampilkan gerakan tangan " + "'Stop'" + " atau perbandingan produk lama vs baru di detik ke-1.",
    },
    {
      id: 2,
      category: "😱 Penyesalan Positif (FOMO Hook)",
      hookText: `Sumpah nyesel banget kenapa baru tahu ada ${shortName} sebagus ini sekarang...`,
      fullTeleprompterScript: `Sumpah nyesel banget kenapa baru tahu ada ${shortName} sebagus ini sekarang! Selama ini aku buang-buang waktu pakai cara lama yang ribet. Sejak ganti ke produk dari ${product.shopName} ini, semuanya beres dalam hitungan detik. Harganya lagi diskon di ${priceRb}, langsung amankan di keranjang kuning ya!`,
      conversionTip: "Gunakan intonasi suara natural seperti sedang curhat ke teman dekat.",
    },
    {
      id: 3,
      category: "💸 Kejutan Harga vs Kualitas (Value Shock)",
      hookText: `Harga cuma ${priceRb} tapi kualitasnya berasa barang ratusan ribu?!`,
      fullTeleprompterScript: `Harga cuma ${priceRb} tapi kualitasnya berasa barang ratusan ribu?! Coba perhatikan detail material dan teksturnya dari dekat. Gak heran rating tokonya tembus ${product.shopRating} bintang dan ribuan orang repeat order setiap minggu. Buat kamu yang mau coba tanpa bikin kantong bolong, klik keranjang kuning sekarang!`,
      conversionTip: "Zoom-in (Macro shot) ke bagian tekstur produk tepat saat menyebut harga.",
    },
    {
      id: 4,
      category: "🔬 Eksperimen / Pembuktian Langsung",
      hookText: `Mari kita buktikan, beneran sebagus klaimnya di FYP atau cuma gimmick iklan?`,
      fullTeleprompterScript: `Mari kita buktikan, beneran sebagus klaimnya di FYP atau cuma gimmick iklan? Hari ini kita tes langsung ${shortName} tanpa filter dan tanpa cut. Lihat sendiri hasilnya dalam 5 detik pertama—langsung kelihatan bedanya dan super praktis. Menurutku dengan harga ${priceRb}, ini wajib banget masuk keranjang kuning kamu!`,
      conversionTip: "Sangat cocok digabungkan dengan Adegan 2 (Demo Produk) dari Google Flow.",
    },
    {
      id: 5,
      category: "🤫 Rahasia / Spill Produk Viral",
      hookText: `Banyak yang nanya di komentar aku pakai apa, akhirnya aku spill rahasianya di sini...`,
      fullTeleprompterScript: `Banyak yang nanya di komentar aku pakai apa, akhirnya aku spill rahasianya di sini! Ini dia ${shortName} yang lagi meledak banget sampai naik ${product.growth7d}% minggu ini. Aku suka banget karena praktis dipakai harian dan awet. Mumpung stok di ${product.shopName} masih ada, langsung checkout dari keranjang kuningku ya!`,
      conversionTip: "Tempel stiker komentar pertanyaan di layar pada 2 detik pertama.",
    },
    {
      id: 6,
      category: "⚡ Masalah Spesifik Target Audiens",
      hookText: `Jangan skip video ini kalau kamu masih sering kesal gara-gara masalah ini setiap hari!`,
      fullTeleprompterScript: `Jangan skip video ini kalau kamu masih sering kesal gara-gara masalah ini setiap hari! Solusi paling simpel yang kutemukan bulan ini adalah ${shortName}. Sekali pakai langsung berasa praktisnya, gak pakai ribet sama sekali. Harganya cuma ${priceRb}, cek keranjang kuning sebelum harga normal kembali!`,
      conversionTip: "Gunakan Adegan 1 Problem-Solution dari Google Flow sebagai pembuka visual.",
    },
    {
      id: 7,
      category: "📊 Bukti Sosial (Social Proof Angka)",
      hookText: `Alasan kenapa lebih dari ${soldText} orang checkout produk ini hanya dalam 7 hari terakhir!`,
      fullTeleprompterScript: `Ini alasan kenapa lebih dari ${soldText} orang checkout ${shortName} hanya dalam 7 hari terakhir! Pertama, fungsinya langsung menjawab kebutuhan harian. Kedua, kualitas finishing-nya rapi dan premium. Ketiga, harganya cuma ${priceRb}. Kalau kamu belum punya, langsung klik keranjang kuning di bawah!`,
      conversionTip: "Tampilkan teks angka penjualan besar di tengah layar pada detik 0–2.",
    },
    {
      id: 8,
      category: "🎧 ASMR / Faceless Visual Hook",
      hookText: `(Suara tenang) Satu barang kecil di bawah ${priceRb} yang bikin rutinitas harian jauh lebih nyaman...`,
      fullTeleprompterScript: `Satu barang kecil di bawah ${priceRb} yang bikin rutinitas harian jauh lebih nyaman dan estetik. Lihat betapa mulus dan rapinya ${shortName} ini saat digunakan. Cocok banget buat kamu yang suka barang praktis tapi tetap kelihatan mewah. Tautan resminya sudah aku sematkan di keranjang kuning.`,
      conversionTip: "Padukan dengan musik Lo-Fi pelan dan efek suara ASMR dari Storyboard.",
    },
    {
      id: 9,
      category: "🆚 Perbandingan Ekspektasi vs Realita",
      hookText: `Ekspektasi beli barang ${priceRb} di TikTok Shop vs Realita pas barangnya sampai...`,
      fullTeleprompterScript: `Ekspektasi beli barang ${priceRb} di TikTok Shop vs Realita pas barangnya sampai! Ternyata ${shortName} dari ${product.shopName} ini jauh melebihi ekspektasi. Kemasannya aman, bahannya kokoh, dan fungsinya 100% sesuai deskripsi. Buat yang cari toko amanah dengan rating ${product.shopRating}, langsung klik keranjang kuning ya!`,
      conversionTip: "Gunakan transisi Whip-Pan dari gambar paket ke hero shot produk.",
    },
    {
      id: 10,
      category: "⏳ Urgensi & Kelangkaan (Scarcity Hook)",
      hookText: `Setiap kali restock selalu ludes dalam hitungan jam, mumpung keranjang kuningnya masih nyala!`,
      fullTeleprompterScript: `Setiap kali restock selalu ludes dalam hitungan jam! ${shortName} ini memang lagi dicari banyak orang karena harganya yang cuma ${priceRb} tapi manfaatnya juara. Kalau kamu masih melihat keranjang kuning di pojok kiri bawah video ini, artinya stok promonya masih tersedia. Yuk amankan sekarang!`,
      conversionTip: "Tambahkan panah animasi menunjuk ke arah ikon Keranjang Kuning di detik ke-9.",
    },
  ];
}

export function generateFlowPackage(
  product: ProductItem,
  style: FlowStyle,
  customVisualNote?: string
): FlowGenerationResult {
  const subjectLocks = customVisualNote
    ? [customVisualNote, ...product.visualLocks]
    : product.visualLocks;
  const locksText = subjectLocks.join(", ");
  const shortTitle = product.title.split(" ").slice(0, 4).join(" ");
  const priceRb = Math.round(product.price / 1000) + "rb";

  let scenes: FlowScenePrompt[] = [];
  let storyboardPanels: StoryboardPanel[] = [];
  let voiceoverScript = "";

  if (style === "problem_solution") {
    scenes = [
      {
        sceneNumber: 1,
        title: "Adegan 1 (0–3 Detik): Visual Hook & Relatable Problem",
        duration: "0s - 3s",
        cameraMovement: "Vertical 9:16, handheld POV close-up, fast push-in",
        prompt: `Vertical 9:16 photorealistic commercial video. Close-up of a relatable daily frustration solved by ${product.title}. High-contrast natural indoor lighting, shallow depth of field, authentic creator POV. Smoothly transition to reveal ${locksText}. No text overlay, 4k realism.`,
      },
      {
        sceneNumber: 2,
        title: "Adegan 2 (3–8 Detik): Product Texture & Action Demo",
        duration: "3s - 8s",
        cameraMovement: "Vertical 9:16, 85mm macro lens, 60fps slow-motion orbit",
        prompt: `Using the uploaded product ingredient reference (${locksText}), capture a crisp macro slow-motion demonstration in action. Highlight the tactile texture and effortless usability under warm studio rim lighting. Ultra-clean product fidelity, smooth camera pan.`,
      },
      {
        sceneNumber: 3,
        title: "Adegan 3 (8–12 Detik): Satisfying Payoff & Hero Shot",
        duration: "8s - 12s",
        cameraMovement: "Vertical 9:16, locked hero shot with warm golden bokeh",
        prompt: `Satisfying after-effect showcase featuring ${locksText} placed on a clean aesthetic surface. Soft morning sunlight rays, commercial color grading, inviting and trustworthy finish.`,
      },
    ];
    storyboardPanels = [
      {
        panelNumber: 1,
        timestamp: "00:00 – 00:03 (Cut 1)",
        visualSummary: "Visual masalah harian + kemunculan cepat produk utama",
        capcutTransition: "Hard Cut / Glitch Zoom Cepat (0.2s) ke Adegan 2",
        onScreenText: `"Masih sering ngalamin ini? Stop! 🛑"`,
        sfxCue: "🔊 Whoosh Bass + Pop Notification Sound",
      },
      {
        panelNumber: 2,
        timestamp: "00:03 – 00:08 (Cut 2)",
        visualSummary: "Slow-motion macro tekstur & cara kerja produk dari dekat",
        capcutTransition: "Smooth Whip-Pan / Pull In (0.3s) ke Adegan 3",
        onScreenText: `"Solusi praktis cuma Rp ${priceRb} ✨"`,
        sfxCue: "🔊 Crisp ASMR Texture / Sparkle Chime",
      },
      {
        panelNumber: 3,
        timestamp: "00:08 – 00:12 (Cut 3)",
        visualSummary: "Hero shot produk di bawah cahaya pagi + panah ke Keranjang Kuning",
        capcutTransition: "Fade Out Halus / Loop kembali ke detik 00:00",
        onScreenText: `"Sudah laku ${product.sold7d.toLocaleString("id-ID")}+ pcs! Cek Keranjang Kuning 👇"`,
        sfxCue: "🔊 Cash Register Ding / Upbeat Outro Beat",
      },
    ];
    voiceoverScript = `"Jangan skip kalau kamu masih sering ngalamin masalah ini! Sejak ganti ke ${shortTitle}, semuanya beres dalam hitungan detik. Cek keranjang kuning sebelum komisinya turun!"`;
  } else if (style === "aesthetic_broll") {
    scenes = [
      {
        sceneNumber: 1,
        title: "Adegan 1 (0–3 Detik): ASMR Unboxing & First Touch",
        duration: "0s - 3s",
        cameraMovement: "Vertical 9:16, top-down flatlay, gentle crane down",
        prompt: `Vertical 9:16 aesthetic faceless ASMR video. Delicate hands unboxing ${locksText} on a minimalist travertine stone table. Dappled morning window shadows, crisp textures, calm luxury mood, no text overlay.`,
      },
      {
        sceneNumber: 2,
        title: "Adegan 2 (3–8 Detik): Sensory Macro Close-Up",
        duration: "3s - 8s",
        cameraMovement: "Vertical 9:16, extreme macro lens, fluid slow-motion",
        prompt: `Extreme close-up sensory shot of ${locksText} showcasing its finest material and finish. Soft diffused backlight, mesmerizing slow motion movement that triggers ASMR satisfaction, 4k photorealistic.`,
      },
      {
        sceneNumber: 3,
        title: "Adegan 3 (8–12 Detik): Cozy Lifestyle Integration",
        duration: "8s - 12s",
        cameraMovement: "Vertical 9:16, slow dolly pull-back",
        prompt: `Cozy modern Indonesian home interior featuring ${locksText} naturally integrated into daily routine. Warm golden hour glow, clean editorial composition.`,
      },
    ];
    storyboardPanels = [
      {
        panelNumber: 1,
        timestamp: "00:00 – 00:03 (Cut 1)",
        visualSummary: "Top-down flatlay tangan membuka produk di meja estetik",
        capcutTransition: "Cross Dissolve Halus (0.4s)",
        onScreenText: `"Racun estetik di bawah Rp ${priceRb} 🤍"`,
        sfxCue: "🔊 Box Opening / Soft Paper Rustle ASMR",
      },
      {
        panelNumber: 2,
        timestamp: "00:03 – 00:08 (Cut 2)",
        visualSummary: "Extreme close-up kilau material & detail produk",
        capcutTransition: "Slow Match Cut (0.3s)",
        onScreenText: `"Detailnya secantik ini..."`,
        sfxCue: "🔊 Soft Water Drop / Gentle Shimmer",
      },
      {
        panelNumber: 3,
        timestamp: "00:08 – 00:12 (Cut 3)",
        visualSummary: "Produk tertata rapi di sudut ruangan dengan cahaya sore",
        capcutTransition: "Seamless Loop ke awal video",
        onScreenText: `"Link resmi ada di Keranjang Kuning 🛒"`,
        sfxCue: "🔊 Warm Lo-Fi Chord Fade",
      },
    ];
    voiceoverScript = `"(Suara ASMR tenang) Satu barang kecil yang bikin rutinitas harian jauh lebih rapi dan estetik. Detailnya secantik ini dan harganya masih ramah di kantong."`;
  } else {
    scenes = [
      {
        sceneNumber: 1,
        title: "Adegan 1 (0–4 Detik): Dramatic Studio Reveal",
        duration: "0s - 4s",
        cameraMovement: "Vertical 9:16, low-angle hero orbit, dramatic rim light",
        prompt: `High-end commercial product reveal of ${locksText} emerging from soft volumetric mist on a sleek reflective pedestal. Dramatic studio rim lighting, 60fps slow-motion orbit, luxury brand aesthetic.`,
      },
      {
        sceneNumber: 2,
        title: "Adegan 2 (4–8 Detik): High-Speed Feature Highlight",
        duration: "4s - 8s",
        cameraMovement: "Vertical 9:16, whip-pan to macro detail",
        prompt: `Dynamic macro showcase of ${locksText} demonstrating its primary premium feature with crisp particles and razor-sharp focus. High-speed commercial cinematography.`,
      },
      {
        sceneNumber: 3,
        title: "Adegan 3 (8–12 Detik): Iconic Packshot",
        duration: "8s - 12s",
        cameraMovement: "Vertical 9:16, centered symmetrical hero composition",
        prompt: `Iconic hero packshot of ${locksText} surrounded by subtle thematic props, soft gradient background lighting, razor-sharp product silhouette.`,
      },
    ];
    storyboardPanels = [
      {
        panelNumber: 1,
        timestamp: "00:00 – 00:04 (Cut 1)",
        visualSummary: "Low-angle reveal dramatis dengan pencahayaan studio mewah",
        capcutTransition: "Speed Ramp / Flash Cut (0.2s)",
        onScreenText: `"Kenapa ${product.sold7d.toLocaleString("id-ID")} orang pilih ini?"`,
        sfxCue: "🔊 Cinematic Deep Riser + Sub Drop",
      },
      {
        panelNumber: 2,
        timestamp: "00:04 – 00:08 (Cut 2)",
        visualSummary: "High-speed kamera menyorot fitur unggulan produk",
        capcutTransition: "Whip Pan Kanan (0.2s)",
        onScreenText: `"Kualitas Premium • Rating ⭐ ${product.shopRating}"`,
        sfxCue: "🔊 Fast Camera Shutter + Swoosh",
      },
      {
        panelNumber: 3,
        timestamp: "00:08 – 00:12 (Cut 3)",
        visualSummary: "Packshot simetris di tengah layar + CTA Checkout",
        capcutTransition: "Zoom Out Lock",
        onScreenText: `"Amankan Promo Rp ${priceRb} di Keranjang Kuning 👇"`,
        sfxCue: "🔊 Luxury Bell Hit",
      },
    ];
    voiceoverScript = `"Ini alasan kenapa lebih dari ${product.sold7d.toLocaleString(
      "id-ID"
    )} orang checkout produk ini dalam 7 hari terakhir. Kualitas premium dengan harga yang masih sangat terjangkau!"`;
  }

  const combinedString = [
    ...product.hashtags.niche,
    ...product.hashtags.product,
    ...product.hashtags.affiliate,
  ].join(" ");

  return {
    productId: product.id,
    productTitle: product.title,
    style,
    ingredientSpec: {
      fileName: `Ingredient_${product.id}_Clean_Cutout.png`,
      resolution: "1080x1920 (9:16 Clean Cutout)",
      subjectLocks,
      instruction:
        "Unggah gambar produk bersih tanpa watermark sebagai aset 'Ingredients' di Google Flow agar bentuk fisik produk konsisten di setiap adegan.",
    },
    scenes,
    storyboardPanels,
    hookFormulas: generateHookFormulas(product),
    voiceoverScript,
    hashtags: {
      ...product.hashtags,
      combinedString,
    },
  };
}
