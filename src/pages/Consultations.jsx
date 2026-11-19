import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  MessageSquare,
  Printer,
  CheckCircle2,
  Send,
} from "lucide-react";
import { consultations as initialConsultations } from "../data/consultations";

export default function Consultations({ user }) {
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem("sims_consultations");
    if (!saved) return initialConsultations;
    try {
      const parsed = JSON.parse(saved);
      return parsed.length < initialConsultations.length ? initialConsultations : parsed;
    } catch {
      return initialConsultations;
    }
  });

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const role = user?.role;
  const isMahasiswa = role === "mahasiswa";
  const canManage = role === "dosen";

  const emptyForm = {
    studentNim: isMahasiswa ? user?.nim || "23021001" : "",
    studentName: isMahasiswa ? user?.name || "Mahasiswa SIMS" : "",
    prodi: user?.prodi || "Informatika",
    date: new Date().toISOString().slice(0, 10),
    topic: "",
    notes: "",
    revision: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const visibleRecords = records.filter((record) => {
    if (role === "mahasiswa") {
      return record.studentNim === user?.nim;
    }
    if (role === "dosen") {
      return record.lecturerEmail === user?.email;
    }
    if (role === "admin") {
      return record.prodi === user?.prodi;
    }
    return false;
  });

  const filteredRecords = visibleRecords.filter((record) => {
    const keyword = search.toLowerCase();
    return (
      record.studentName.toLowerCase().includes(keyword) ||
      record.studentNim.toLowerCase().includes(keyword) ||
      record.topic.toLowerCase().includes(keyword)
    );
  });

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);
    setFormData({
      studentNim: record.studentNim,
      studentName: record.studentName,
      prodi: record.prodi,
      date: record.date,
      topic: record.topic,
      notes: record.notes,
      revision: record.revision,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.studentNim.trim() || !formData.studentName.trim()) {
      setError("NIM dan nama mahasiswa wajib diisi.");
      return;
    }

    const cleanData = {
      ...formData,
      studentNim: formData.studentNim.trim(),
      studentName: formData.studentName.trim(),
      topic: formData.topic.trim(),
      notes: formData.notes.trim(),
      revision: formData.revision.trim(),
    };

    let updatedRecords;
    if (editingId !== null) {
      updatedRecords = records.map((record) =>
        record.id === editingId ? { ...record, ...cleanData } : record
      );
      setSuccess("Catatan konsultasi berhasil diperbarui.");
    } else {
      const newEntry = {
        id: Date.now(),
        ...cleanData,
        lecturerEmail: isMahasiswa ? "enrico@unklab.ac.id" : user.email,
        lecturerName: isMahasiswa ? "Enrico Manurung" : user.name,
      };
      updatedRecords = [newEntry, ...records];
      setSuccess(
        isMahasiswa
          ? "Pengajuan bimbingan berhasil dikirim ke dosen pembimbing!"
          : "Catatan konsultasi berhasil disimpan!"
      );
    }

    setRecords(updatedRecords);
    localStorage.setItem("sims_consultations", JSON.stringify(updatedRecords));

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus catatan konsultasi ini?"
    );

    if (confirmed) {
      const updated = records.filter((record) => record.id !== id);
      setRecords(updated);
      localStorage.setItem("sims_consultations", JSON.stringify(updated));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mahasiswa saat ini untuk cetak
  const currentStudentName =
    filteredRecords[0]?.studentName || user?.name || "Mahasiswa";
  const currentStudentNim =
    filteredRecords[0]?.studentNim || user?.nim || "-";
  const currentProdi = filteredRecords[0]?.prodi || user?.prodi || "Informatika";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Riwayat Konsultasi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isMahasiswa
              ? "Pantau dan cetak kartu kontrol bimbingan skripsi Anda."
              : "Kelola dan rekam arahan revisi skripsi mahasiswa."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filteredRecords.length > 0 && (
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Printer size={16} />
              Cetak Kartu Bimbingan
            </button>
          )}

          {(canManage || isMahasiswa) && (
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
            >
              {isMahasiswa ? <Send size={16} /> : <Plus size={16} />}
              {isMahasiswa ? "Ajukan Bimbingan" : "Tambah Konsultasi"}
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* MODAL / FORM ADD & EDIT */}
      {showForm && (
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h2 className="font-semibold text-lg text-slate-800">
              {editingId !== null
                ? "Edit Catatan Konsultasi"
                : isMahasiswa
                ? "Form Pengajuan Sesi Bimbingan"
                : "Tambah Catatan Konsultasi Baru"}
            </h2>

            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  NIM Mahasiswa
                </label>
                <input
                  required
                  disabled={isMahasiswa}
                  value={formData.studentNim}
                  onChange={(e) =>
                    setFormData({ ...formData, studentNim: e.target.value })
                  }
                  placeholder="Contoh: 23021001"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Nama Mahasiswa
                </label>
                <input
                  required
                  disabled={isMahasiswa}
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({ ...formData, studentName: e.target.value })
                  }
                  placeholder="Nama mahasiswa"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Program Studi
                </label>
                <select
                  disabled={isMahasiswa}
                  value={formData.prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, prodi: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none disabled:bg-slate-100 text-sm"
                >
                  <option>Informatika</option>
                  <option>Sistem Informasi</option>
                  <option>Teknologi Informasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Tanggal Bimbingan
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Topik / Bab Bahasan
                </label>
                <input
                  required
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="Contoh: Pembahasan Metodologi Penelitian & Bab 3"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  {isMahasiswa
                    ? "Rangkuman Progres yang Telah Dikerjakan"
                    : "Catatan Konsultasi"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={
                    isMahasiswa
                      ? "Jelaskan bab atau bagian apa yang ingin dikonsultasikan..."
                      : "Tuliskan hasil pembahasan konsultasi..."
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  {isMahasiswa
                    ? "Pertanyaan / Kendala yang Dihadapi (Opsional)"
                    : "Arahan / Revisi dari Dosen"}
                </label>
                <textarea
                  rows={3}
                  value={formData.revision}
                  onChange={(e) =>
                    setFormData({ ...formData, revision: e.target.value })
                  }
                  placeholder={
                    isMahasiswa
                      ? "Tuliskan bagian yang membingungkan atau butuh masukan khusus..."
                      : "Tuliskan poin-poin yang wajib diperbaiki mahasiswa..."
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm"
              >
                {isMahasiswa ? "Kirim Pengajuan" : "Simpan Catatan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DAFTAR CATATAN KONSULTASI */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari topik atau mahasiswa..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Total Catatan:</span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700 font-bold">
              {filteredRecords.length} Sesi
            </span>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              Belum ada riwayat konsultasi.
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {isMahasiswa
                ? "Tekan tombol 'Ajukan Bimbingan' untuk memulai konsultasi dengan dosen."
                : "Catatan konsultasi akan muncul di halaman ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-indigo-100 transition"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                        #{filteredRecords.length - index}
                      </span>
                      <h3 className="font-semibold text-slate-800">
                        {record.topic}
                      </h3>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      {record.studentName} · {record.studentNim}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {record.prodi} · Tanggal: {record.date}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Dosen Pembimbing:{" "}
                      <strong className="text-slate-700">
                        {record.lecturerName || "Dosen SIMS"}
                      </strong>
                    </p>
                  </div>

                  {canManage && record.lecturerEmail === user.email && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(record)}
                        className="p-2 h-fit text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Edit Catatan"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 h-fit text-red-500 hover:bg-red-50 rounded-lg"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Catatan Pembahasan
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {record.notes}
                    </p>
                  </div>

                  <div className="bg-indigo-50/60 rounded-lg p-3.5 border border-indigo-100/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
                      Arahan / Revisi Dosen
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {record.revision || "Tidak ada catatan revisi khusus."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINT PREVIEW MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* NO-PRINT CONTROLS */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Printer size={18} className="text-indigo-600" />
                Pratinjau Kartu Bimbingan Skripsi
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT AREA */}
            <div className="p-4 border border-slate-200 rounded-xl bg-white text-slate-900 print:border-none print:p-0">
              {/* LETTERHEAD */}
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                <h3 className="text-base font-bold uppercase tracking-wide">
                  UNIVERSITAS KLABAT
                </h3>
                <h4 className="text-sm font-semibold uppercase">
                  FAKULTAS ILMU KOMPUTER
                </h4>
                <p className="text-xs text-slate-600">
                  Jl. Arnold Mononutu, Airmadidi, Minahasa Utara, Sulawesi Utara 95371
                </p>
                <h2 className="mt-3 text-sm font-extrabold uppercase tracking-wider underline">
                  KARTU KONTROL KONSULTASI SKRIPSI
                </h2>
              </div>

              {/* STUDENT INFO */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div>
                  <p>
                    <span className="font-semibold w-24 inline-block">Nama</span>:{" "}
                    {currentStudentName}
                  </p>
                  <p>
                    <span className="font-semibold w-24 inline-block">NIM</span>:{" "}
                    {currentStudentNim}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold w-24 inline-block">Program Studi</span>:{" "}
                    {currentProdi}
                  </p>
                  <p>
                    <span className="font-semibold w-24 inline-block">Status</span>:{" "}
                    {filteredRecords.length >= 3
                      ? "Memenuhi Syarat Defense (>= 3x)"
                      : "Sedang Berlangsung"}
                  </p>
                </div>
              </div>

              {/* TABLE */}
              <table className="w-full border-collapse border border-slate-400 text-xs mb-6">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-8">
                      No
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left w-24">
                      Tanggal
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">
                      Topik Bahasan
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-left">
                      Catatan / Arahan Revisi
                    </th>
                    <th className="border border-slate-400 px-2 py-1.5 text-center w-20">
                      Paraf Dosen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, i) => (
                    <tr key={r.id}>
                      <td className="border border-slate-400 px-2 py-2 text-center">
                        {i + 1}
                      </td>
                      <td className="border border-slate-400 px-2 py-2">
                        {r.date}
                      </td>
                      <td className="border border-slate-400 px-2 py-2 font-medium">
                        {r.topic}
                      </td>
                      <td className="border border-slate-400 px-2 py-2">
                        {r.revision || r.notes}
                      </td>
                      <td className="border border-slate-400 px-2 py-2 text-center text-slate-400 italic text-[10px]">
                        ✓ Valid
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-slate-400 p-4 text-center text-slate-400"
                      >
                        Belum ada data konsultasi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* SIGNATURE SECTION */}
              <div className="grid grid-cols-2 text-xs pt-4">
                <div></div>
                <div className="text-center">
                  <p>Airmadidi, {new Date().toLocaleDateString("id-ID")}</p>
                  <p className="mt-1">Dosen Pembimbing Skripsi,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">
                    {filteredRecords[0]?.lecturerName || "Enrico Manurung, M.Kom."}
                  </p>
                  <p className="text-[10px] text-slate-500">NIDN: 0012345601</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
