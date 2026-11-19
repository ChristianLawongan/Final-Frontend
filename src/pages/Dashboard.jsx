import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  BookOpen,
  ArrowRight,
  Users,
  UserRound,
  Sparkles,
  CheckCircle2,
  FileText,
  MapPin,
} from "lucide-react";

import { students } from "../data/students";
import { lecturers } from "../data/lecturers";
import { theses as initialTheses } from "../data/theses";
import { consultations } from "../data/consultations";
import { getSchedules } from "../services/dbService";

export default function Dashboard({ user }) {
  const [schedules, setSchedules] = useState([]);

  // Ambil data skripsi (dengan dukungan localStorage jika ada modifikasi)
  const [thesisList] = useState(() => {
    const saved = localStorage.getItem("sims_theses");
    return saved ? JSON.parse(saved) : initialTheses;
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getSchedules();
        setSchedules(data || []);
      } catch (err) {
        console.error("Gagal mengambil data jadwal:", err);
      }
    }
    load();
  }, []);

  const role = user?.role || "admin";

  // Filter jadwal sesuai role
  const publishedSchedules = schedules.filter((s) => s.published);

  const mySchedules = publishedSchedules.filter((s) => {
    if (role === "mahasiswa") return s.studentNim === user?.nim;
    if (role === "dosen") {
      const lecturer = lecturers.find(
        (l) => l.email.toLowerCase() === user?.email?.toLowerCase()
      );
      return (
        lecturer &&
        (s.examiner1 === lecturer.name || s.examiner2 === lecturer.name)
      );
    }
    return true; // Admin melihat semua
  });

  // Skripsi mahasiswa login
  const studentThesis = thesisList.find((t) => t.studentNim === user?.nim);

  // Ambil data konsultasi dengan dukungan localStorage
  const currentConsultations = (() => {
    const saved = localStorage.getItem("sims_consultations");
    if (!saved) return consultations;
    try {
      const parsed = JSON.parse(saved);
      return parsed.length < consultations.length ? consultations : parsed;
    } catch {
      return consultations;
    }
  })();

  const studentConsultations = currentConsultations.filter(
    (c) => c.studentNim === user?.nim
  );

  // Dosen stats
  const lecturerConsultations = currentConsultations.filter(
    (c) => c.lecturerEmail === user?.email
  );

  // Admin stats
  const readyForDefenseCount = thesisList.filter(
    (t) => t.status === "Ready for Defense"
  ).length;

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div>
        <p className="text-sm font-medium text-indigo-600">Overview Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Selamat Datang, {user?.name || "Pengguna"}!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sistem Informasi Manajemen Skripsi — Fakultas Ilmu Komputer UNKLAB.
        </p>
      </div>

      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 p-7 text-white shadow-lg">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-8 h-48 w-48 rounded-full border border-white/10" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm">
            <Sparkles size={14} />
            {role === "admin"
              ? "Panel Admin / Kaprodi"
              : role === "dosen"
              ? "Panel Dosen Pembimbing & Penguji"
              : "Portal Skripsi Mahasiswa"}
          </div>

          <h2 className="text-2xl font-bold">
            {role === "admin"
              ? "Kelola Skripsi & Jadwal Defense Berbantuan AI"
              : role === "dosen"
              ? "Pantau Konsultasi & Jadwal Ujian Mahasiswa"
              : "Pantau Perjalanan Skripsi Anda Secara Terstruktur"}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-indigo-100/90">
            {role === "admin"
              ? "Pantau kemajuan skripsi seluruh mahasiswa, catat aktivitas, dan gunakan AI Gemini untuk mencocokkan dosen penguji dengan keahlian yang relevan."
              : role === "dosen"
              ? "Catat hasil bimbingan mahasiswa, berikan catatan revisi, dan lihat agenda pengujian seminar/defense yang ditugaskan kepada Anda."
              : "Lihat draf skripsi Anda, catat kemajuan konsultasi dengan dosen pembimbing, dan pantau status jadwal defense."}
          </p>
        </div>
      </div>

      {/* STAT CARDS BERDASARKAN ROLE */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {role === "admin" && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Mahasiswa
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {students.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Mahasiswa terdaftar</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Dosen
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <UserRound size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {lecturers.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Dosen pengajar & penguji</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Siap Defense
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-amber-600">
                {readyForDefenseCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Perlu penjadwalan penguji AI
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jadwal Defense
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarDays size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-600">
                {publishedSchedules.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Sidang dipublikasikan</p>
            </div>
          </>
        )}

        {role === "dosen" && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Konsultasi Dicatat
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {lecturerConsultations.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Total riwayat bimbingan</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tugas Penguji
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CalendarDays size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-indigo-600">
                {mySchedules.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Jadwal defense mendatang</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Aksi Cepat
                </p>
                <Link
                  to="/konsultasi"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Buka Konsultasi →
                </Link>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">
                Catat bimbingan baru dengan mahasiswa
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Dokumentasikan topik, catatan, serta arahan revisi skripsi.
              </p>
            </div>
          </>
        )}

        {role === "mahasiswa" && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status Skripsi
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen size={18} />
                </div>
              </div>
              <p className="mt-3 text-lg font-bold text-indigo-600 truncate">
                {studentThesis?.status || "Belum Mengajukan"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Status terkini</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Log Bimbingan
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {studentConsultations.length} / 3 Sesi
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {studentConsultations.length >= 3
                  ? "Syarat bimbingan terpenuhi (3/3)"
                  : `Menuju syarat defense (${studentConsultations.length}/3)`}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Jadwal Ujian
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <CalendarDays size={18} />
                </div>
              </div>
              <p className="mt-2 text-base font-bold text-slate-900">
                {mySchedules.length > 0
                  ? `${mySchedules[0].date} (${mySchedules[0].time} WITA)`
                  : "Menunggu Jadwal Defense"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {mySchedules.length > 0
                  ? `Ruang: ${mySchedules[0].location}`
                  : "Jadwal akan dirilis setelah diverifikasi Kaprodi."}
              </p>
            </div>
          </>
        )}
      </div>

      {/* CONTENT GRID */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* SECTION 1: JADWAL DEFENSE MENDATANG */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Jadwal Defense Mendatang
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Jadwal ujian skripsi mahasiswa yang telah dipublikasikan.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays size={20} />
            </div>
          </div>

          <div className="mt-5">
            {mySchedules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <CalendarDays size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  Belum ada jadwal defense untuk Anda.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Jadwal yang diterbitkan oleh Admin akan tampil di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySchedules.slice(0, 3).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                        {item.prodi}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.date} · {item.time} WITA
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-800">
                      {item.studentName} ({item.studentNim})
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{item.thesisTitle}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-indigo-600" />
                        {item.location}
                      </span>
                      <span>
                        Penguji: {item.examiner1} & {item.examiner2}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: AKTIVITAS & PANDUAN CEPAT */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                {role === "admin"
                  ? "Mahasiswa Siap Defense"
                  : role === "dosen"
                  ? "Bimbingan Terakhir"
                  : "Ringkasan Skripsi"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {role === "admin"
                  ? "Perlu dijadwalkan dengan rekomendasi AI"
                  : "Aktivitas terbaru di portal SIMS"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Clock size={20} />
            </div>
          </div>

          <div className="mt-5">
            {role === "admin" && (
              <div className="space-y-3">
                {thesisList
                  .filter((t) => t.status === "Ready for Defense")
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {t.studentName} · {t.studentNim}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {t.title}
                        </p>
                      </div>
                      <Link
                        to="/defense"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        <Sparkles size={13} />
                        Jadwalkan AI
                      </Link>
                    </div>
                  ))}

                {readyForDefenseCount === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">
                    Tidak ada mahasiswa yang menunggu penjadwalan defense.
                  </p>
                )}
              </div>
            )}

            {role === "dosen" && (
              <div className="space-y-3">
                {consultations.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{c.studentName} ({c.studentNim})</span>
                      <span className="text-slate-400">{c.date}</span>
                    </div>
                    <p className="mt-1 font-medium text-indigo-600">{c.topic}</p>
                    <p className="mt-1 text-slate-500 line-clamp-1">{c.notes}</p>
                  </div>
                ))}
              </div>
            )}

            {role === "mahasiswa" && (
              <div className="space-y-4">
                {studentThesis ? (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Topik Terdaftar
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-slate-800">
                      {studentThesis.title}
                    </h4>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {studentThesis.abstract}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/skripsi-saya"
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Detail Skripsi
                        <ArrowRight size={13} />
                      </Link>
                      <Link
                        to="/konsultasi"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Riwayat Konsultasi
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      Belum ada skripsi terdaftar
                    </p>
                    <p className="text-xs text-slate-400 mt-1 mb-3">
                      Ajukan judul dan draf skripsi Anda sekarang.
                    </p>
                    <Link
                      to="/skripsi-saya"
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Ajukan Skripsi
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
