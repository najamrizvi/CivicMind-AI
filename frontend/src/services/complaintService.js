import api from "../api/api";

const complaintService = {
  submitComplaint: async (complaintText) => {
    const response = await api.post(
      "/complaints/",
      {
        complaint_text: complaintText,
      }
    );

    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get(
      "/complaints/my"
    );

    return response.data;
  },

  getComplaintById: async (complaintId) => {
    const response = await api.get(
      `/complaints/${complaintId}`
    );

    return response.data;
  },

  // ==========================================================
  // TRACK COMPLAINT
  // ==========================================================

  trackComplaint: async (trackingNumber) => {
    const response = await api.get(
      `/tracking/${encodeURIComponent(
        trackingNumber
      )}`
    );

    return response.data;
  },
};

export default complaintService;