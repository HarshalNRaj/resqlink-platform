import api from "./client";

export const auth = {
  login: (username, password) => api.post("/auth/login/", { username, password }),
  register: (payload) => api.post("/auth/register/", payload),
  me: () => api.get("/auth/me/"),
  updateMe: (payload) => api.patch("/auth/me/", payload),
  donors: (bloodGroup) => api.get("/auth/donors/", { params: { blood_group: bloodGroup || undefined } }),
  pendingVerifications: () => api.get("/auth/verifications/pending/"),
  approveOrg: (id) => api.post(`/auth/verifications/${id}/approve/`),
};

export const resources = {
  list: (params) => api.get("/resources/", { params }),
  get: (id) => api.get(`/resources/${id}/`),
  create: (payload) => api.post("/resources/", payload),
  requestItem: (id) => api.post(`/resources/${id}/request_item/`),
  assign: (id) => api.post(`/resources/${id}/assign/`),
  complete: (id) => api.post(`/resources/${id}/complete/`),
  cancel: (id) => api.post(`/resources/${id}/cancel/`),
};

export const food = {
  list: (params) => api.get("/food/", { params }),
  get: (id) => api.get(`/food/${id}/`),
  create: (payload) => api.post("/food/", payload),
  requestItem: (id) => api.post(`/food/${id}/request_item/`),
  assign: (id) => api.post(`/food/${id}/assign/`),
  complete: (id) => api.post(`/food/${id}/complete/`),
  cancel: (id) => api.post(`/food/${id}/cancel/`),
};

export const blood = {
  list: (params) => api.get("/blood/requests/", { params }),
  get: (id) => api.get(`/blood/requests/${id}/`),
  create: (payload) => api.post("/blood/requests/", payload),
  offerToDonate: (id) => api.post(`/blood/requests/${id}/offer_to_donate/`),
  matchBloodBank: (id) => api.post(`/blood/requests/${id}/match_blood_bank/`),
  fulfill: (id) => api.post(`/blood/requests/${id}/fulfill/`),
  cancel: (id) => api.post(`/blood/requests/${id}/cancel/`),
  banks: () => api.get("/blood/banks/"),
  createBank: (payload) => api.post("/blood/banks/", payload),
};

export const emergency = {
  list: (params) => api.get("/emergency/", { params }),
  get: (id) => api.get(`/emergency/${id}/`),
  create: (payload) => api.post("/emergency/", payload),
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
