import { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  CalendarDays,
  Pencil,
  Tag,
  Loader2,
  FileText,
  Save,
  X,
} from "lucide-react";
import { theses as initialTheses } from "../data/theses";
import { consultations as initialConsultations } from "../data/consultations";
import { getSchedules } from "../services/dbService";
import { analyzeThesis } from "../services/aiService";

export default function MyThesis({ user }) {
  // Ambil data skripsi mahasiswa yang login
  const [thesisList, setThesisList] = useState(() => {
    const saved = localStorage.getItem("sims_theses");
    return saved ? JSON.parse(saved) : initialTheses;
  });

  const [schedules, setSchedules] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const currentThesis = thesisList.find(
    (t) => t.studentNim === user?.nim
  );

  const [formData, setFormData] = useState({
    title: currentThesis?.title || "",
    abstract: currentThesis?.abstract || "",
    keywords: currentThesis?.keywords?.join(", ") || "",
    prodi: currentThesis?.prodi || user?.prodi || "Informatika",
  });

  // Hitung bimbingan mahasiswa ini (dengan dukungan localStorage)
  const currentConsultations = (() => {
    const saved = localStorage.getItem("sims_consultations");
    if (!saved) return initialConsultations;
    try {
      const parsed = JSON.parse(saved);
      return parsed.length < initialConsultations.length ? initialConsultations : parsed;
    } catch {
      return initialConsultations;
    }
  })();

  const myConsultations = currentConsultations.filter(
    (c) => c.studentNim === user?.nim
  );

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const data = await getSchedules();
        const published = data.find(
          (s) => s.published && s.studentNim === user?.nim
        );
        if (published) setSchedules([published]);
      } catch (err) {
        console.error("Gagal mengambil jadwal defense:", err);
      }
    }
    fetchSchedule();
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    const updatedKeywords = formData.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    let updatedList;
    if (currentThesis) {
      updatedList = thesisList.map((t) =>
        t.studentNim === user?.nim
          ? {
              ...t,
              title: formData.title,
              abstract: formData.abstract,
              keywords: updatedKeywords,
              prodi: formData.prodi,
            }
          : t
      );
    } else {
      const newThesis = {
        id: Date.now(),
        studentNim: user?.nim || "23021001",
        studentName: user?.name || "Mahasiswa SIMS",
        prodi: formData.prodi,
        title: formData.title,
        abstract: formData.abstract,
        keywords: updatedKeywords,
        status: "Proposal",
      };
      updatedList = [...thesisList, newThesis];
    }

    setThesisList(updatedList);
    localStorage.setItem("sims_theses", JSON.stringify(updatedList));
    setIsEditing(false);
    setSaveSuccess("Data skripsi berhasil disimpan!");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  const handleRunAiAnalysis = async () => {
    if (!currentThesis && (!formData.title || !formData.abstract)) {
      setAiError("Isi judul dan abstrak terlebih dahulu.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    const thesisToAnalyze = currentThesis || {
      title: formData.title,
      abstract: formData.abstract,
      keywords: formData.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    };

    try {
      const result = await analyzeThesis(thesisToAnalyze);
      setAiResult(result);
    } catch (err) {
      setAiError(err.message || "Gagal menghubungkan ke layanan Gemini AI.");
    } finally {
      setAiLoading(false);
    }
  };

  // Status timeline steps
  const steps = [
    { label: "Pengajuan Proposal", key: "Proposal" },
    { label: "Penelitian & Bimbingan", key: "Research in Progress" },
    { label: "Penyelesaian Skripsi", key: "Thesis Completion" },
    { label: "Siap Ujian (Defense)", key: "Ready for Defense" },
    { label: "Selesai", key: "Completed" },
  ];

  const currentStatusIndex = steps.findIndex(
    (s) => s.key === currentThesis?.status
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600">Portal Mahasiswa</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Skripsi Saya</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola judul, abstrak, dan pantau perkembangan skripsi Anda.
          </p>
        </div>

        {currentThesis && !isEditing && (
          <button
            onClick={() => {
              setFormData({
                title: currentThesis.title,
                abstract: currentThesis.abstract,
                keywords: currentThesis.keywords.join(", "),
                prodi: currentThesis.prodi,
              });
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Pencil size={16} />
            Edit Topik Skripsi
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* TIMELINE PROGRESS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
          Alur & Progres Skripsi
        </h2>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {steps.map((step, idx) => {
              const isPast = currentStatusIndex >= idx;
              const isCurrent = currentStatusIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`flex md:flex-col items-center gap-3 p-3 rounded-xl border transition ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                      : isPast
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-slate-100 bg-white text-slate-400"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isPast && !isCurrent ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="md:text-center">
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-indigo-700"
                          : isPast
                          ? "text-emerald-800"
                          : "text-slate-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-0.5 text-[10px] font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Status Saat Ini
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORM EDIT / TAMBAH */}
      {(!currentThesis || isEditing) && (
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              {currentThesis ? "Edit Topik & Abstrak Skripsi" : "Pengajuan Judul Skripsi Baru"}
            </h2>
            {currentThesis && (
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Judul Skripsi
              </label>
              <textarea
                required
                rows={2}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Penerapan Machine Learning untuk Prediksi Kelulusan Mahasiswa"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Abstrak Penelitian
              </label>
              <textarea
                required
                rows={4}
                value={formData.abstract}
                onChange={(e) =>
                  setFormData({ ...formData, abstract: e.target.value })
                }
                placeholder="Tuliskan latar belakang singkat, tujuan, dan metode yang akan digunakan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Kata Kunci (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                  placeholder="Machine Learning, Data Mining, Prediksi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Program Studi
                </label>
                <select
                  value={formData.prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, prodi: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Informatika">Informatika</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknologi Informasi">Teknologi Informasi</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              {currentThesis && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
              >
                <Save size={16} />
                Simpan Topik
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL SKRIPSI UTAMA */}
      {currentThesis && !isEditing && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* KOLOM KIRI: DETAIL SKRIPSI (2 COLS) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <BookOpen size={14} />
                  {currentThesis.prodi}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    currentThesis.status === "Ready for Defense"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <Clock size={13} />
                  Status: {currentThesis.status}
                </span>
              </div>

              <div className="mt-5">
                <h2 className="text-xl font-bold leading-relaxed text-slate-900">
                  {currentThesis.title}
                </h2>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Abstrak
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {currentThesis.abstract}
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kata Kunci
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {currentThesis.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      <Tag size={12} className="text-slate-400" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* CEK DENGAN GEMINI AI BUTTON */}
              <div className="mt-8 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                      <Sparkles size={15} />
                      Asisten Gemini AI
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      Analisis kecocokan topik, bidang keahlian, dan kategori skripsi Anda secara otomatis.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAiAnalysis}
                    disabled={aiLoading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Uji Topik dengan AI
                      </>
                    )}
                  </button>
                </div>

                {aiError && (
                  <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                    {aiError}
                  </div>
                )}

                {aiResult && (
                  <div className="mt-4 space-y-3 rounded-lg border border-indigo-200 bg-white p-4 text-xs">
                    <div>
                      <p className="font-semibold text-indigo-900">Kategori Penelitian:</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {aiResult.categories?.map((cat, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-indigo-900">Keahlian Relevan:</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {aiResult.relevantExpertise?.map((exp, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">Alasan Analisis AI:</p>
                      <p className="mt-1 leading-relaxed text-slate-600">
                        {aiResult.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* KOLOM KANAN: STATUS BIMBINGAN & DEFENSE (1 COL) */}
          <div className="space-y-6">
            {/* STATUS JADWAL DEFENSE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-900 pb-3 border-b border-slate-100">
                <CalendarDays size={18} className="text-indigo-600" />
                <h3>Jadwal Defense</h3>
              </div>

              {schedules.length > 0 ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5">
                    <span className="inline-block rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      Terjadwal
                    </span>
                    <p className="mt-2 text-sm font-bold text-emerald-950">
                      {new Date(`${schedules[0].date}T00:00:00`).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                    <p className="text-xs text-emerald-800">
                      Pukul: {schedules[0].time} WITA
                    </p>
                    <p className="text-xs text-emerald-800">
                      Ruang: {schedules[0].location}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <p>
                      <strong>Penguji 1:</strong> {schedules[0].examiner1}
                    </p>
                    <p>
                      <strong>Penguji 2:</strong> {schedules[0].examiner2}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-center">
                  <Clock size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">
                    Belum dijadwalkan
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Jadwal akan ditentukan oleh Kaprodi setelah skripsi dinyatakan siap defense.
                  </p>
                </div>
              )}
            </div>

            {/* RINGKASAN BIMBINGAN */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Log Konsultasi
                </h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  {myConsultations.length} / 3 Sesi
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Target Bimbingan Min:</span>
                  <span className="font-semibold text-slate-700">3 Sesi</span>
                </div>
                {/* Progress bar bimbingan */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{
                      width: `${Math.min(
                        (myConsultations.length / 3) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {myConsultations.length >= 3
                    ? "✓ Syarat minimal bimbingan sudah terpenuhi (3/3)."
                    : `Perlu ${
                        3 - myConsultations.length
                      } sesi bimbingan lagi sebelum defense.`}
                </p>

                {myConsultations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Sesi Terakhir:
                    </p>
                    <div className="rounded-lg bg-slate-50 p-2.5 text-xs">
                      <p className="font-medium text-slate-800">
                        {myConsultations[myConsultations.length - 1].topic}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {myConsultations[myConsultations.length - 1].date} · Dosen:{" "}
                        {myConsultations[myConsultations.length - 1].lecturerName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
