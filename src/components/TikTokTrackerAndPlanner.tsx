"use client";

import React, { useState, useEffect } from "react";
import { ProductItem } from "@/lib/mock-data";

interface TikTokTrackerProps {
  products: ProductItem[];
  onTriggerToast: (msg: string) => void;
  onOpenFlowWithProduct: (product: ProductItem) => void;
}

interface HourlyTrafficPoint {
  hour: string;
  hourNum: number;
  activityPercent: number;
  avgViews: number;
  isGoldenHour: boolean;
  note: string;
}

interface CheckInLog {
  dayNumber: number;
  dateStr: string;
  videoNote: string;
}

interface ContentPlanItem {
  id: string;
  dayName: string;
  timeSlot: string;
  productId: string;
  productTitle: string;
  hookStyle: string;
  status: "PLANNED" | "DONE";
}

const HOURLY_TRAFFIC_DATA: HourlyTrafficPoint[] = [
  { hour: "00:00", hourNum: 0, activityPercent: 22, avgViews: 1400, isGoldenHour: false, note: "Audiens mulai tidur, trafik rendah." },
  { hour: "01:00", hourNum: 1, activityPercent: 14, avgViews: 900, isGoldenHour: false, note: "Jam trafik terendah dini hari." },
  { hour: "02:00", hourNum: 2, activityPercent: 10, avgViews: 650, isGoldenHour: false, note: "Zona istirahat malam." },
  { hour: "03:00", hourNum: 3, activityPercent: 12, avgViews: 720, isGoldenHour: false, note: "Mulai ada trafik sahur/subuh." },
  { hour: "04:00", hourNum: 4, activityPercent: 18, avgViews: 1100, isGoldenHour: false, note: "Persiapan aktivitas pagi." },
  { hour: "05:00", hourNum: 5, activityPercent: 32, avgViews: 2400, isGoldenHour: false, note: "Audiens baru bangun pagi." },
  { hour: "06:00", hourNum: 6, activityPercent: 48, avgViews: 4100, isGoldenHour: false, note: "Scrolling pagi sebelum berangkat kerja." },
  { hour: "07:00", hourNum: 7, activityPercent: 55, avgViews: 4900, isGoldenHour: false, note: "Jam komuter pagi." },
  { hour: "08:00", hourNum: 8, activityPercent: 46, avgViews: 3800, isGoldenHour: false, note: "Mulai jam kerja/sekolah." },
  { hour: "09:00", hourNum: 9, activityPercent: 52, avgViews: 4400, isGoldenHour: false, note: "Ibu rumah tangga mulai aktif belanja." },
  { hour: "10:00", hourNum: 10, activityPercent: 64, avgViews: 6200, isGoldenHour: false, note: "Pemanasan menuju jam istirahat siang." },
  { hour: "11:00", hourNum: 11, activityPercent: 85, avgViews: 11200, isGoldenHour: true, note: "⭐ GOLDEN HOUR 1: Waktu terbaik upload 30–45 menit sebelum jam makan siang!" },
  { hour: "12:00", hourNum: 12, activityPercent: 92, avgViews: 14500, isGoldenHour: true, note: "🔥 PUNCAK SIANG: Jam istirahat kantor, konversi checkout sangat tinggi." },
  { hour: "13:00", hourNum: 13, activityPercent: 74, avgViews: 8400, isGoldenHour: false, note: "Sisa trafik istirahat siang." },
  { hour: "14:00", hourNum: 14, activityPercent: 58, avgViews: 5300, isGoldenHour: false, note: "Jam kerja siang, trafik stabil." },
  { hour: "15:00", hourNum: 15, activityPercent: 66, avgViews: 6800, isGoldenHour: false, note: "Sore hari mulai santai." },
  { hour: "16:00", hourNum: 16, activityPercent: 82, avgViews: 10600, isGoldenHour: true, note: "⭐ GOLDEN HOUR 2: Upload jam 16:00–16:30 untuk menangkap gelombang pulang kerja!" },
  { hour: "17:00", hourNum: 17, activityPercent: 78, avgViews: 9400, isGoldenHour: false, note: "Perjalanan pulang kerja/kampus." },
  { hour: "18:00", hourNum: 18, activityPercent: 84, avgViews: 11800, isGoldenHour: false, note: "Persiapan prime time malam." },
  { hour: "19:00", hourNum: 19, activityPercent: 96, avgViews: 18400, isGoldenHour: true, note: "⭐ GOLDEN HOUR 3 (TERBAIK): Upload jam 19:00 agar meledak di jam 20:00!" },
  { hour: "20:00", hourNum: 20, activityPercent: 100, avgViews: 22500, isGoldenHour: true, note: "🚀 PUNCAK TERTINGGI HARIAN: 100% audiens santai & paling sering checkout keranjang kuning!" },
  { hour: "21:00", hourNum: 21, activityPercent: 91, avgViews: 16200, isGoldenHour: true, note: "🔥 PRIME TIME MALAM: Masih sangat ramai untuk live & video pendek." },
  { hour: "22:00", hourNum: 22, activityPercent: 68, avgViews: 7600, isGoldenHour: false, note: "Scrolling sebelum tidur." },
  { hour: "23:00", hourNum: 23, activityPercent: 40, avgViews: 3200, isGoldenHour: false, note: "Trafik malam mulai turun." },
];

export default function TikTokTrackerAndPlanner({
  products,
  onTriggerToast,
  onOpenFlowWithProduct,
}: TikTokTrackerProps) {
  // 1. TikTok Account Connection State
  const [isConnected, setIsConnected] = useState(true);
  const [tiktokHandle, setTiktokHandle] = useState("@rina.affiliate.id");
  const [accountFollowers, setAccountFollowers] = useState("48.5K");
  const [selectedHour, setSelectedHour] = useState<HourlyTrafficPoint>(
    HOURLY_TRAFFIC_DATA[19]
  );

  // 2. 6-Month (180 Days) Streak & Daily Reminder State
  const [targetStreakDays, setTargetStreakDays] = useState<number>(180); // 6 months
  const [currentStreak, setCurrentStreak] = useState<number>(14);
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [todayVideoNote, setTodayVideoNote] = useState<string>("");
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([
    {
      dayNumber: 14,
      dateStr: "Kemarin, 19:10 WIB",
      videoNote: "Video Flow Adegan 1-3 Moisture Glow Gel (#racuntiktok)",
    },
    {
      dayNumber: 13,
      dateStr: "2 Hari Lalu, 11:30 WIB",
      videoNote: "Video Spin Mop Pisah Air Kotor & Bersih",
    },
  ]);

  // Daily Reminder State
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderTime1, setReminderTime1] = useState<string>("11:15");
  const [reminderTime2, setReminderTime2] = useState<string>("18:45");

  // 3. 7-Day Content Planner State
  const [contentPlans, setContentPlans] = useState<ContentPlanItem[]>([
    {
      id: "plan-1",
      dayName: "Senin",
      timeSlot: "11:15 WIB (Golden Hour Siang)",
      productId: products[0]?.id || "prod-1",
      productTitle: products[0]?.title || "Moisture Glow Niacinamide Gel",
      hookStyle: "Problem-Solution Hook",
      status: "DONE",
    },
    {
      id: "plan-2",
      dayName: "Senin",
      timeSlot: "19:00 WIB (Prime Time Malam)",
      productId: products[1]?.id || "prod-5",
      productTitle: products[1]?.title || "Extrait de Parfum Vanilla",
      hookStyle: "Aesthetic ASMR B-Roll",
      status: "PLANNED",
    },
    {
      id: "plan-3",
      dayName: "Selasa",
      timeSlot: "16:15 WIB (Sore Pulang Kerja)",
      productId: products[2]?.id || "prod-6",
      productTitle: products[2]?.title || "Tumbler Kopi Layar LED",
      hookStyle: "Cinematic Macro Showcase",
      status: "PLANNED",
    },
  ]);
  const [newPlanDay, setNewPlanDay] = useState("Rabu");
  const [newPlanTime, setNewPlanTime] = useState("19:00 WIB (Prime Time Malam)");
  const [newPlanProductId, setNewPlanProductId] = useState(
    products[0]?.id || "prod-1"
  );
  const [newPlanStyle, setNewPlanStyle] = useState("Problem-Solution Hook");

  // Load saved streak from localStorage
  useEffect(() => {
    try {
      const savedStreak = localStorage.getItem("toktrend_streak_count");
      const savedChecked = localStorage.getItem("toktrend_checked_today");
      const savedHandle = localStorage.getItem("toktrend_tt_handle");
      if (savedStreak) setCurrentStreak(Number(savedStreak));
      if (savedChecked === "true") setCheckedInToday(true);
      if (savedHandle) setTiktokHandle(savedHandle);
    } catch {}
  }, []);

  const handleConnectTikTok = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnected(true);
    try {
      localStorage.setItem("toktrend_tt_handle", tiktokHandle);
    } catch {}
    onTriggerToast(
      `Akun TikTok ${tiktokHandle} berhasil disinkronkan! Data jam aktif audiens diperbarui.`
    );
  };

  const handleCheckInUploadToday = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkedInToday) {
      onTriggerToast("Anda sudah melakukan Check-In upload hari ini!");
      return;
    }
    const nextStreak = currentStreak + 1;
    setCurrentStreak(nextStreak);
    setCheckedInToday(true);
    const note =
      todayVideoNote.trim() ||
      `Upload Video Affiliate Hari ke-${nextStreak}`;
    setCheckInLogs((prev) => [
      {
        dayNumber: nextStreak,
        dateStr: "Hari ini, Baru saja",
        videoNote: note,
      },
      ...prev,
    ]);
    setTodayVideoNote("");
    try {
      localStorage.setItem("toktrend_streak_count", String(nextStreak));
      localStorage.setItem("toktrend_checked_today", "true");
    } catch {}
    playReminderSound();
    onTriggerToast(
      `🔥 Luar biasa! Streak Anda bertambah menjadi ${nextStreak} Hari Tanpa Bolong!`
    );
  };

  // Web Audio Chime + Browser Notification for Daily Reminder
  const playReminderSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const handleTestReminderAlert = async () => {
    playReminderSound();
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification("⏰ Waktunya Upload Video TikTok Affiliate!", {
          body: `Sekarang memasuki Golden Hour FYP! Jangan biarkan Streak ${currentStreak} hari tanpa bolong Anda terputus.`,
        });
      }
    }
    onTriggerToast(
      `🔔 Pengingat aktif! Bunyi alarm & notifikasi dijadwalkan pukul ${reminderTime1} & ${reminderTime2} WIB.`
    );
  };

  const handleAddContentPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const prod =
      products.find((p) => p.id === newPlanProductId) || products[0];
    const newItem: ContentPlanItem = {
      id: "plan-" + Date.now(),
      dayName: newPlanDay,
      timeSlot: newPlanTime,
      productId: prod.id,
      productTitle: prod.title,
      hookStyle: newPlanStyle,
      status: "PLANNED",
    };
    setContentPlans((prev) => [...prev, newItem]);
    onTriggerToast(`Jadwal konten hari ${newPlanDay} berhasil ditambahkan!`);
  };

  const togglePlanStatus = (id: string) => {
    setContentPlans((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "DONE" ? "PLANNED" : "DONE" }
          : item
      )
    );
  };

  const streakProgressPercent = Math.min(
    100,
    Math.round((currentStreak / targetStreakDays) * 100)
  );

  return (
    <section className="space-y-6">
      {/* Daily Reminder Warning Banner if not checked in today */}
      {!checkedInToday ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">⏰</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Pengingat Harian Aktif ({reminderTime1} &amp; {reminderTime2}{" "}
                WIB)
              </p>
              <p className="text-sm font-semibold text-white">
                Anda belum Check-In upload video hari ini! Pertahankan Streak{" "}
                <strong>{currentStreak} Hari</strong> menuju target{" "}
                <strong>{targetStreakDays} Hari (6 Bulan) Tanpa Bolong</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={handleTestReminderAlert}
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition shrink-0"
          >
            🔔 Tes Bunyi Pengingat
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Target Hari Ini Selesai!
              </p>
              <p className="text-sm font-semibold text-white">
                Mantap! Anda sudah upload video hari ini. Streak aktif:{" "}
                <strong>{currentStreak} Hari Berturut-turut Tanpa Bolong!</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* BAGIAN 1: CONNECT TIKTOK & GRAFIK JAM PALING RAMAI (PRIME TIME)   */}
      {/* ================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                {isConnected ? "🟢 TERHUBUNG KE TIKTOK ANALYTICS" : "⚪ BELUM TERHUBUNG"}
              </span>
              <span className="text-xs text-slate-400">
                Followers: <strong>{accountFollowers}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1">
              📊 Analitik Jam Paling Ramai Ditonton &amp; Rekomendasi Jam Upload
              FYP
            </h2>
            <p className="text-sm text-slate-400">
              Berdasarkan histori tontonan audiens akun{" "}
              <strong className="text-white">{tiktokHandle}</strong>, berikut
              adalah distribusi trafik penonton selama 24 jam.
            </p>
          </div>

          <form
            onSubmit={handleConnectTikTok}
            className="flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={tiktokHandle}
              onChange={(e) => setTiktokHandle(e.target.value)}
              placeholder="@username_tiktok"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              🔄 Sinkronkan Akun TikTok
            </button>
          </form>
        </div>

        {/* 3 Golden Hour Recommendation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">
                🌅 Sesi 1: Golden Hour Siang
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                85%–92% Ramai
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              Upload Pukul 11:00 – 11:30 WIB
            </p>
            <p className="text-xs text-slate-400">
              Menangkap lonjakan penonton jam istirahat makan siang (12:00 WIB).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">
                🌇 Sesi 2: Golden Hour Sore
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                82% Ramai
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              Upload Pukul 15:45 – 16:15 WIB
            </p>
            <p className="text-xs text-slate-400">
              Menangkap audiens yang mulai pulang kerja &amp; santai sore.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">
                🌙 Sesi 3: PRIME TIME UTAMA (Terbaik)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
                100% Puncak FYP
              </span>
            </div>
            <p className="text-lg font-bold text-white">
              Upload Pukul 18:45 – 19:15 WIB
            </p>
            <p className="text-xs text-emerald-200/80">
              Video terindeks tepat saat puncak transaksi tertinggi pukul
              19:30–21:00 WIB!
            </p>
          </div>
        </div>

        {/* Interactive 24-Hour Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-300">
              📈 Grafik Keaktifan Penonton 24 Jam (Klik batang jam untuk detail)
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                <span>Golden Hour (Rekomendasi Upload)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-500/60 inline-block" />
                <span>Jam Normal</span>
              </span>
            </div>
          </div>

          <div className="h-48 flex items-end gap-1.5 pt-6 pb-2 px-1 overflow-x-auto">
            {HOURLY_TRAFFIC_DATA.map((point) => {
              const isSelected = selectedHour.hour === point.hour;
              return (
                <button
                  key={point.hour}
                  type="button"
                  onClick={() => setSelectedHour(point)}
                  className="flex-1 min-w-[28px] flex flex-col items-center gap-1.5 group focus:outline-none"
                >
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-white">
                    {point.activityPercent}%
                  </span>
                  <div className="w-full h-32 bg-slate-900 rounded-t-md flex items-end overflow-hidden border border-slate-800/80">
                    <div
                      style={{ height: `${point.activityPercent}%` }}
                      className={`w-full transition-all rounded-t-md ${
                        point.isGoldenHour
                          ? "bg-emerald-500 group-hover:bg-emerald-400"
                          : "bg-indigo-500/50 group-hover:bg-indigo-400"
                      } ${isSelected ? "ring-2 ring-white" : ""}`}
                    />
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      point.isGoldenHour
                        ? "font-bold text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {point.hour.slice(0, 2)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Hour Detail Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-white text-sm">
                Pukul {selectedHour.hour} WIB
              </span>{" "}
              <span className="text-emerald-400 font-semibold ml-2">
                • Rata-rata {selectedHour.avgViews.toLocaleString("id-ID")} views
                / jam ({selectedHour.activityPercent}% audiens aktif)
              </span>
              <p className="text-slate-300 mt-1">{selectedHour.note}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BAGIAN 2: TARGET KONSISTENSI UPLOAD (6 BULAN TANPA BOLONG)        */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: 180-Day Streak Tracker & Heatmap Grid */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base">
                🔥 Misi Konsistensi Upload: {targetStreakDays} Hari (6 Bulan)
                Tanpa Bolong
              </h3>
              <p className="text-xs text-slate-400">
                Kunci utama algoritma TikTok Affiliate adalah konsistensi tanpa
                putus.
              </p>
            </div>
            <select
              value={targetStreakDays}
              onChange={(e) => setTargetStreakDays(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-emerald-400"
            >
              <option value={30}>Target: 30 Hari Tanpa Bolong</option>
              <option value={90}>Target: 90 Hari (3 Bulan)</option>
              <option value={180}>Target: 180 Hari (6 Bulan Tanpa Bolong)</option>
            </select>
          </div>

          {/* Streak Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400">Streak Saat Ini:</span>
                <p className="text-2xl font-bold text-emerald-400">
                  🔥 {currentStreak} / {targetStreakDays} Hari Berturut-turut
                </p>
              </div>
              <span className="text-lg font-bold text-indigo-400">
                {streakProgressPercent}% Selesai
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${streakProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Check-In Form Today */}
          <form
            onSubmit={handleCheckInUploadToday}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
          >
            <label className="block text-xs font-bold text-slate-300">
              ✅ Sudah Upload Video Hari Ini? Catat &amp; Tambah Streak Anda:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={todayVideoNote}
                onChange={(e) => setTodayVideoNote(e.target.value)}
                placeholder="Judul produk / link video TikTok yang diupload hari ini..."
                className="flex-1 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              />
              <button
                type="submit"
                disabled={checkedInToday}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 ${
                  checkedInToday
                    ? "bg-emerald-600/30 text-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                }`}
              >
                {checkedInToday
                  ? "✓ Sudah Check-In Hari Ini"
                  : "🔥 Check-In Upload Hari Ini (+1 Hari)"}
              </button>
            </div>
          </form>

          {/* 180-Day Visual Grid (6 Months Consistency Board) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Papan Visual Konsistensi {targetStreakDays} Hari:</span>
              <span>
                Hijau = Sudah Upload ({currentStreak} hari) • Abu = Hari
                Berikutnya
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-15 sm:grid-cols-30 gap-1.5 max-h-44 overflow-y-auto">
              {Array.from({ length: targetStreakDays }).map((_, idx) => {
                const dayNum = idx + 1;
                const isDone = dayNum <= currentStreak;
                const isNext = dayNum === currentStreak + 1;
                return (
                  <div
                    key={dayNum}
                    title={`Hari ke-${dayNum}: ${
                      isDone ? "Sudah Upload ✅" : "Belum"
                    }`}
                    className={`h-5 rounded-xs flex items-center justify-center text-[10px] font-mono ${
                      isDone
                        ? "bg-emerald-500 text-slate-950 font-bold"
                        : isNext
                        ? "bg-amber-500/30 border border-amber-400 text-amber-300 animate-pulse"
                        : "bg-slate-900 text-slate-600 border border-slate-800"
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Daily Reminder Alarm Settings & Recent Check-In Logs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base">
                ⏰ Pengaturan Pengingat Upload Harian
              </h3>
              <p className="text-xs text-slate-400">
                Jangan sampai lupa posting di jam Golden Hour!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled((prev) => !prev)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                reminderEnabled
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {reminderEnabled ? "🔔 Pengingat ON" : "🔕 Pengingat OFF"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label className="block text-slate-400">
                Jam Pengingat 1 (Siang)
              </label>
              <input
                type="time"
                value={reminderTime1}
                onChange={(e) => setReminderTime1(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm font-bold text-white"
              />
              <span className="block text-emerald-400">
                45 mnt sebelum puncak 12:00
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label className="block text-slate-400">
                Jam Pengingat 2 (Prime Time)
              </label>
              <input
                type="time"
                value={reminderTime2}
                onChange={(e) => setReminderTime2(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-sm font-bold text-white"
              />
              <span className="block text-emerald-400">
                45 mnt sebelum puncak 19:30
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestReminderAlert}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            🔔 Aktifkan Notifikasi Browser &amp; Uji Alarm Sekarang
          </button>

          {/* Recent Upload Check-in Logs */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Riwayat Check-In Upload Terakhir:
            </h4>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {checkInLogs.map((log, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-emerald-400">
                      Hari ke-{log.dayNumber}
                    </span>{" "}
                    <span className="text-slate-400">• {log.dateStr}</span>
                    <p className="text-slate-200 mt-0.5">{log.videoNote}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BAGIAN 3: KALENDER KONTEN & JADWAL POSTING 7 HARI                 */}
      {/* ================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base">
              📅 Kalender Konten &amp; Jadwal Posting Affiliate 7 Hari
            </h3>
            <p className="text-xs text-slate-400">
              Rencanakan produk mana yang akan diposting pada jam Golden Hour
              setiap harinya agar Anda tidak pernah kehabisan stok video.
            </p>
          </div>
        </div>

        {/* Add Schedule Form */}
        <form
          onSubmit={handleAddContentPlan}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs"
        >
          <div>
            <label className="block text-slate-400 mb-1">Pilih Hari</label>
            <select
              value={newPlanDay}
              onChange={(e) => setNewPlanDay(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              {[
                "Senin",
                "Selasa",
                "Rabu",
                "Kamis",
                "Jumat",
                "Sabtu",
                "Minggu",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">
              Slot Jam Golden Hour
            </label>
            <select
              value={newPlanTime}
              onChange={(e) => setNewPlanTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <option value="11:15 WIB (Golden Hour Siang)">
                11:15 WIB (Golden Hour Siang)
              </option>
              <option value="16:15 WIB (Sore Pulang Kerja)">
                16:15 WIB (Sore Pulang Kerja)
              </option>
              <option value="19:00 WIB (Prime Time Malam)">
                19:00 WIB (Prime Time Malam)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Produk Target</label>
            <select
              value={newPlanProductId}
              onChange={(e) => setNewPlanProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Gaya Video Flow</label>
            <select
              value={newPlanStyle}
              onChange={(e) => setNewPlanStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <option value="Problem-Solution Hook">
                Problem-Solution Hook
              </option>
              <option value="Aesthetic ASMR B-Roll">
                Aesthetic ASMR B-Roll
              </option>
              <option value="Cinematic Macro Showcase">
                Cinematic Macro Showcase
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
            >
              ➕ Tambah ke Jadwal
            </button>
          </div>
        </form>

        {/* Planned Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {contentPlans.map((plan) => {
            const linkedProd =
              products.find((p) => p.id === plan.productId) || products[0];
            return (
              <div
                key={plan.id}
                className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                  plan.status === "DONE"
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                    {plan.dayName} • {plan.timeSlot}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`px-2 py-0.5 rounded font-bold ${
                      plan.status === "DONE"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {plan.status === "DONE" ? "✓ Selesai" : "Tandai Selesai"}
                  </button>
                </div>
                <p className="font-bold text-sm text-white">
                  {plan.productTitle}
                </p>
                <p className="text-slate-400">
                  Gaya Konten: <strong>{plan.hookStyle}</strong>
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenFlowWithProduct(linkedProd)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    🎬 Buka Prompt di Flow Studio →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
