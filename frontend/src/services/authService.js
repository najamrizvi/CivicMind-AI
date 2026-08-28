import api from "../api/api";

const STORAGE_KEY = "civicmind_user";

const authService = {
  // ============================================================
  // REGISTER
  // ============================================================

  register: async (userData) => {
    const response = await api.post("/auth/register", {
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
    });

    return response.data;
  },

  // ============================================================
  // LOGIN
  // ============================================================

  login: async (userData) => {
    const response = await api.post("/auth/login", {
      email: userData.email,
      password: userData.password,
    });

    const data = response.data;

    if (data.access_token) {
      localStorage.setItem("civicmind_token", data.access_token);
    }

    if (data.user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ============================================================
  // CURRENT USER
  // ============================================================

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  // ============================================================
  // STORED USER
  // ============================================================

  getStoredUser: () => {
    const storedUser = localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  // ============================================================
  // TOKEN
  // ============================================================

  getToken: () => {
    return localStorage.getItem("civicmind_token");
  },

  // ============================================================
  // LOGOUT
  // ============================================================

  logout: () => {
    localStorage.removeItem("civicmind_token");
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default authService;