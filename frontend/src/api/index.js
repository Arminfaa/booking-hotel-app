import api from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateMe: (payload) => api.patch("/auth/me", payload).then((r) => r.data),
};

export const hotelsApi = {
  list: (params) => api.get("/hotels", { params }).then((r) => r.data),
  get: (id) => api.get(`/hotels/${id}`).then((r) => r.data),
  availability: (id, params) =>
    api.get(`/hotels/${id}/availability`, { params }).then((r) => r.data),
  reviews: (id) => api.get(`/hotels/${id}/reviews`).then((r) => r.data),
  createReview: (id, payload) =>
    api.post(`/hotels/${id}/reviews`, payload).then((r) => r.data),
};

export const bookingsApi = {
  create: (payload) => api.post("/bookings", payload).then((r) => r.data),
  mine: () => api.get("/bookings/me").then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data),
};

export const bookmarksApi = {
  list: () => api.get("/bookmarks").then((r) => r.data),
  add: (hotelId, note = "") =>
    api.post("/bookmarks", { hotelId, note }).then((r) => r.data),
  remove: (hotelId) => api.delete(`/bookmarks/${hotelId}`).then((r) => r.data),
  status: (hotelId) =>
    api.get(`/bookmarks/${hotelId}/status`).then((r) => r.data),
};
