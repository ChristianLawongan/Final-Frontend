
const API_URL = "http://localhost:3002";

// HELPER
async function handleResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json();
}

// THESIS
export async function getTheses() {
  const response = await fetch(`${API_URL}/theses`);
  return handleResponse(response, "Gagal mengambil data skripsi.");
}

export async function createThesis(thesis) {
  const response = await fetch(`${API_URL}/theses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(thesis),
  });

  return handleResponse(response, "Gagal menyimpan data skripsi.");
}

export async function updateThesis(id, thesis) {
  const response = await fetch(
    `${API_URL}/theses/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(thesis),
    }
  );

  return handleResponse(response, "Gagal memperbarui data skripsi.");
}

export async function deleteThesis(id) {
  const response = await fetch(
    `${API_URL}/theses/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Gagal menghapus data skripsi.");
  }

  return true;
}

// DEFENSE SCHEDULE
export async function getSchedules() {
  const response = await fetch(`${API_URL}/schedules`);
  return handleResponse(response, "Gagal mengambil data jadwal.");
}

export async function createSchedule(schedule) {
  const response = await fetch(`${API_URL}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schedule),
  });

  return handleResponse(response, "Gagal menyimpan jadwal.");
}

export async function publishSchedule(id) {
  const response = await fetch(`${API_URL}/schedules/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      published: true,
      status: "Dipublikasikan",
    }),
  });

  return handleResponse(response, "Gagal memublikasikan jadwal.");
}
