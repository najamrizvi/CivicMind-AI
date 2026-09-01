import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "civicmind_token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // Let Axios/browser automatically set the
    // correct multipart Content-Type and boundary
    // when FormData is being uploaded.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;