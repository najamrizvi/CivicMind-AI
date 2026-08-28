import api from "../api/api";

const profileService = {
  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  updateProfile: async (fullName) => {
    const response = await api.put(
      "/auth/profile",
      {
        full_name: fullName,
      }
    );

    return response.data;
  },

  // ============================================================
  // UPLOAD PROFILE PICTURE
  // ============================================================

  uploadProfilePicture: async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
      "/auth/profile-picture",
      formData
    );

    return response.data;
  },

  // ============================================================
  // DELETE PROFILE PICTURE
  // ============================================================

  deleteProfilePicture: async () => {
    const response = await api.delete(
      "/auth/profile-picture"
    );

    return response.data;
  },
};

export default profileService;