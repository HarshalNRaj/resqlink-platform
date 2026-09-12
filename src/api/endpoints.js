import api from "./client";

export const auth = {
  login: (creds) => api.post("/auth/login/", creds),
  register: (data) => api.post("/auth/register/", data),
  me: () => api.get("/auth/me/"),
  updateMe: (data) => api.patch("/auth/me/", data),
  donors: (params) => api.get("/auth/donors/", { params }),
  pendingVerifications: () => api.get("/auth/verifications/pending/"),
  approveVerification: (id) => api.post(`/auth/verifications/${id}/approve/`),
};

export const resources = {
  list: (params) => api.get("/resources/", { params }),
  get: (id) => api.get(`/resources/${id}/`),
  create: (data) => api.post("/resources/", data),
  update: (id, data) => api.patch(`/resources/${id}/`, data),
  delete: (id) => api.delete(`/resources/${id}/`),
  requestItem: (id) => api.post(`/resources/${id}/request_item/`),
  assign: (id) => api.post(`/resources/${id}/assign/`),
  complete: (id) => api.post(`/resources/${id}/complete/`),
  cancel: (id) => api.post(`/resources/${id}/cancel/`),
};

export const food = {
  list: (params) => api.get("/food/", { params }),
  get: (id) => api.get(`/food/${id}/`),
  create: (data) => api.post("/food/", data),
  update: (id, data) => api.patch(`/food/${id}/`, data),
  delete: (id) => api.delete(`/food/${id}/`),
  requestItem: (id) => api.post(`/food/${id}/request_item/`),
  assign: (id) => api.post(`/food/${id}/assign/`),
  complete: (id) => api.post(`/food/${id}/complete/`),
  cancel: (id) => api.post(`/food/${id}/cancel/`),
};

export const blood = {
  list: (params) => api.get("/blood/requests/", { params }),
  get: (id) => api.get(`/blood/requests/${id}/`),
  create: (data) => api.post("/blood/requests/", data),
  offerToDonate: (id) => api.post(`/blood/requests/${id}/offer_to_donate/`),
  matchBloodBank: (id) => api.post(`/blood/requests/${id}/match_blood_bank/`),
  fulfill: (id) => api.post(`/blood/requests/${id}/fulfill/`),
  cancel: (id) => api.post(`/blood/requests/${id}/cancel/`),
  banks: () => api.get("/blood/banks/"),
  createBank: (data) => api.post("/blood/banks/", data),
  updateBank: (id, data) => api.patch(`/blood/banks/${id}/`, data),
  myBank: () => api.get("/blood/banks/me/"),
  saveMyBank: (data) => api.post("/blood/banks/me/", data),
};

export const emergency = {
  list: (params) => api.get("/emergency/", { params }),
  get: (id) => api.get(`/emergency/${id}/`),
  create: (data) => api.post("/emergency/", data),
  claim: (id) => api.post(`/emergency/${id}/claim/`),
  fulfill: (id) => api.post(`/emergency/${id}/fulfill/`),
  close: (id) => api.post(`/emergency/${id}/close/`),
};

export const notifications = {
  list: () => api.get("/notifications/"),
  markRead: (id) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post("/notifications/read-all/"),
};

export const impact = {
  summary: () => api.get("/impact/summary/"),
};

export default {
  auth,
  resources,
  food,
  blood,
  emergency,
  notifications,
  impact,
};
