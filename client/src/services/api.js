const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const tokenStorage = {
  get:    ()      => localStorage.getItem("between_us_token"),
  set:    (token) => localStorage.setItem("between_us_token", token),
  remove: ()      => localStorage.removeItem("between_us_token"),
};

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = tokenStorage.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

async function uploadRequest(path, formData) {
  const token = tokenStorage.get();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  const data = await res.json();
  if (res.ok) return data;
  throw new Error(data.message || "Upload failed");
}

export const authApi = {
  register: (email, password, nickname, inviteCode) =>
    request("POST", "/auth/register", { email, password, nickname, inviteCode }),
  login: (email, password) =>
    request("POST", "/auth/login", { email, password }),
  getMe: () =>
    request("GET", "/auth/me"),
};

export const memoriesApi = {
  getAll: (year = null) => {
    const query = year ? `?year=${year}` : "";
    return request("GET", `/memories${query}`);
  },
  getOne: (id) => request("GET", `/memories/${id}`),
  upload: (file, difficulty, secretMessage, songUrl) => {
    const formData = new FormData();
    formData.append("image",      file);
    formData.append("difficulty", difficulty);
    if (secretMessage) formData.append("secretMessage", secretMessage);
    if (songUrl)       formData.append("songUrl",       songUrl);
    return uploadRequest("/memories", formData);
  },
  delete: (id) => request("DELETE", `/memories/${id}`),
};

export const guessesApi = {
  submit: (memoryId, guessText) =>
    request("POST", `/memories/${memoryId}/guess`, { guessText }),
  get: (memoryId) =>
    request("GET", `/memories/${memoryId}/guess`),
  decide: (memoryId, decision) =>
    request("POST", `/memories/${memoryId}/guess/decide`, { decision }),
};

export const userApi = {
  getProfile:     ()         => request("GET", "/user/me"),
  getPartner:     ()         => request("GET", "/user/partner"),
  updateNickname: (nickname) => request("PUT", "/user/nickname", { nickname }),
};

export const pushApi = {
  subscribe: (subscription) => request("POST", "/push/subscribe", subscription),
  unsubscribe: (endpoint) => request("DELETE", "/push/unsubscribe", { endpoint }),
  getVapidKey: () => request("GET", "/push/vapid-key"),
};