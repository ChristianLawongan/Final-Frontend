
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpen,
} from "lucide-react";

import { theses as initialTheses } from "../data/theses";

import {
  getTheses,
  createThesis,
  updateThesis,
  deleteThesis,
} from "../services/dbService";

export default function Theses() {
  const [thesesList, setThesesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedThesis, setSelectedThesis] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pengunci agar proses load tidak berjalan bersamaan
  const loadingRef = useRef(false);

  const emptyForm = {
    studentNim: "",
    studentName: "",
    prodi: "Informatika",
    title: "",
    abstract: "",
    keywords: "",
    status: "Proposal",
  };

  const [formData, setFormData] = useState(emptyForm);

  const statuses = [
    "Proposal",
    "Research in Progress",
    "Thesis Completion",
    "Ready for Defense",
    "Completed",
  ];

  // =====================================
  // LOAD DATA DARI JSON SERVER
  // =====================================

  async function loadTheses() {
    // Cegah proses load berjalan bersamaan
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      let data = await getTheses();

      // Masukkan data awal hanya jika database kosong
      if (data.length === 0) {
        const initialData = await Promise.all(
          initialTheses.map((thesis) => {
            const { id, ...thesisData } = thesis;
            return createThesis(thesisData);
          })
        );

        data = initialData;
      }

      setThesesList(data);
    } catch (err) {
      setError(
        err.message || "Gagal mengambil data skripsi dari server."
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    loadTheses();
  }, []);

  // =====================================
  // FILTER DATA
  // =====================================

  const filteredTheses = thesesList.filter((thesis) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      (thesis.studentName || "").toLowerCase().includes(keyword) ||
      (thesis.studentNim || "").toLowerCase().includes(keyword) ||
      (thesis.title || "").toLowerCase().includes(keyword);

    const matchesStatus =
      selectedStatus === "Semua" ||
      thesis.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // =====================================
  // FORM TAMBAH DAN EDIT
  // =====================================

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(thesis) {
    setEditingId(thesis.id);

    setFormData({
      studentNim: thesis.studentNim || "",
      studentName: thesis.studentName || "",
      prodi: thesis.prodi || "Informatika",
      title: thesis.title || "",
      abstract: thesis.abstract || "",
      keywords: Array.isArray(thesis.keywords)
        ? thesis.keywords.join(", ")
        : "",
      status: thesis.status || "Proposal",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  }

  // =====================================
  // SIMPAN DATA KE JSON SERVER
  // =====================================

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanData = {
      studentNim: formData.studentNim.trim(),
      studentName: formData.studentName.trim(),
      prodi: formData.prodi,
      title: formData.title.trim(),
      abstract: formData.abstract.trim(),
      keywords: formData.keywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      status: formData.status,
    };

    if (
      !cleanData.studentNim ||
      !cleanData.studentName ||
      !cleanData.title ||
      !cleanData.abstract ||
      cleanData.keywords.length === 0
    ) {
      setError(
        "Semua data wajib diisi, termasuk minimal satu kata kunci."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        // UPDATE DATA
        const updatedThesis = await updateThesis(
          editingId,
          cleanData
        );

        setThesesList((previous) =>
          previous.map((thesis) =>
            String(thesis.id) === String(editingId)
              ? updatedThesis
              : thesis
          )
        );

        setSelectedThesis((previous) =>
          previous &&
          String(previous.id) === String(editingId)
            ? updatedThesis
            : previous
        );

        setSuccess("Data skripsi berhasil diperbarui.");
      } else {
        // TAMBAH DATA
        const newThesis = await createThesis(cleanData);

        setThesesList((previous) => [
          ...previous,
          newThesis,
        ]);

        setSuccess("Data skripsi berhasil ditambahkan.");
      }

      closeForm();
    } catch (err) {
      setError(
        err.message || "Gagal menyimpan data skripsi."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================
  // HAPUS DATA DARI JSON SERVER
  // =====================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus data skripsi ini?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteThesis(id);

      setThesesList((previous) =>
        previous.filter(
          (thesis) => String(thesis.id) !== String(id)
        )
      );

      setSelectedThesis((previous) =>
        previous && String(previous.id) === String(id)
          ? null
          : previous
      );

      setSuccess("Data skripsi berhasil dihapus.");
    } catch (err) {
      setError(
        err.message || "Gagal menghapus data skripsi."
      );
    }
  }

  // =====================================
  // WARNA STATUS
  // =====================================

  function statusColor(status) {
    if (status === "Ready for Defense") {
      return "bg-green-50 text-green-700";
    }

    if (status === "Completed") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "Research in Progress") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  // =====================================
  // TAMPILAN
  // =====================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Data Skripsi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola informasi dan perkembangan skripsi mahasiswa.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Tambah Skripsi
        </button>
      </div>

      {/* NOTIFIKASI */}
      {error && !showForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* FORM TAMBAH / EDIT */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {editingId !== null
                ? "Edit Data Skripsi"
                : "Tambah Data Skripsi"}
            </h2>

            <button
              type="button"
              onClick={closeForm}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  NIM
                </label>

                <input
                  required
                  value={formData.studentNim}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentNim: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  placeholder="NIM mahasiswa"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nama Mahasiswa
                </label>

                <input
                  required
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentName: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  placeholder="Nama mahasiswa"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Program Studi
                </label>

                <select
                  value={formData.prodi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prodi: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  <option>Informatika</option>
                  <option>Sistem Informasi</option>
                  <option>Teknologi Informasi</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Status Skripsi
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Judul Skripsi
                </label>

                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  placeholder="Masukkan judul skripsi"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Abstrak
                </label>

                <textarea
                  required
                  rows={5}
                  value={formData.abstract}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      abstract: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  placeholder="Masukkan abstrak skripsi..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Kata Kunci
                </label>

                <input
                  required
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keywords: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                  placeholder="Machine Learning, Data Mining, Prediksi"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Pisahkan kata kunci menggunakan koma.
                </p>
              </div>

            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Skripsi"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TABEL DATA SKRIPSI */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">

        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row">

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari mahasiswa atau judul skripsi..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="Semua">Semua Status</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

        </div>

        <p className="mb-4 text-sm text-slate-500">
          Total skripsi:{" "}
          <strong>{thesesList.length}</strong>
        </p>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Memuat data skripsi...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3">Mahasiswa</th>
                  <th className="px-3 py-3">Judul Skripsi</th>
                  <th className="px-3 py-3">Program Studi</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredTheses.map((thesis) => (
                  <tr
                    key={thesis.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">
                        {thesis.studentName}
                      </p>

                      <p className="text-xs text-slate-500">
                        {thesis.studentNim}
                      </p>
                    </td>

                    <td className="max-w-xs px-3 py-3">
                      <p className="text-slate-700">
                        {thesis.title}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-slate-600">
                      {thesis.prodi}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${statusColor(thesis.status)}`}
                      >
                        {thesis.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1">

                        <button
                          onClick={() => setSelectedThesis(thesis)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          title="Detail"
                        >
                          <BookOpen size={16} />
                        </button>

                        <button
                          onClick={() => openEditForm(thesis)}
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(thesis.id)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTheses.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-slate-400"
                    >
                      {loading
                        ? "Memuat data..."
                        : "Data skripsi tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* DETAIL SKRIPSI */}
      {selectedThesis && (
        <div className="space-y-4 rounded-xl border border-indigo-200 bg-white p-6">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Detail Skripsi
            </h2>

            <button
              onClick={() => setSelectedThesis(null)}
              className="text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="font-semibold text-indigo-700">
            {selectedThesis.title}
          </h3>

          <p className="text-sm text-slate-600">
            {selectedThesis.studentName} ·{" "}
            {selectedThesis.studentNim}
          </p>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              ABSTRAK
            </p>

            <p className="text-sm text-slate-700">
              {selectedThesis.abstract}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              KATA KUNCI
            </p>

            <div className="flex flex-wrap gap-2">
              {(selectedThesis.keywords || []).map(
                (keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">
              STATUS
            </p>

            <span
              className={`rounded-full px-2.5 py-1 text-xs ${statusColor(selectedThesis.status)}`}
            >
              {selectedThesis.status}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
