import api from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  refresh: () => api.post("/auth/refresh").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateMe: (payload) => api.patch("/auth/me", payload).then((r) => r.data),
};

export const hotelsApi = {
  list: (params) => api.get("/hotels", { params }).then((r) => r.data),
  mine: () => api.get("/hotels/mine/list").then((r) => r.data),
  get: (id) => api.get(`/hotels/${id}`).then((r) => r.data),
  availability: (id, params) =>
    api.get(`/hotels/${id}/availability`, { params }).then((r) => r.data),
  calendar: (id, params) =>
    api.get(`/hotels/${id}/calendar`, { params }).then((r) => r.data),
  reviews: (id) => api.get(`/hotels/${id}/reviews`).then((r) => r.data),
  createReview: (id, payload) =>
    api.post(`/hotels/${id}/reviews`, payload).then((r) => r.data),
  create: (payload) => api.post("/hotels", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/hotels/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/hotels/${id}`).then((r) => r.data),
};

export const bookingsApi = {
  create: (payload) => api.post("/bookings", payload).then((r) => r.data),
  mine: () => api.get("/bookings/me").then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then((r) => r.data),
  pay: (id, payload) => api.post(`/bookings/${id}/pay`, payload).then((r) => r.data),
};

export const bookmarksApi = {
  list: () => api.get("/bookmarks").then((r) => r.data),
  add: (hotelId, note = "") =>
    api.post("/bookmarks", { hotelId, note }).then((r) => r.data),
  remove: (hotelId) => api.delete(`/bookmarks/${hotelId}`).then((r) => r.data),
  status: (hotelId) =>
    api.get(`/bookmarks/${hotelId}/status`).then((r) => r.data),
  share: () => api.post("/bookmarks/share").then((r) => r.data),
  shared: (token) => api.get(`/bookmarks/shared/${token}`).then((r) => r.data),
};

export const messagesApi = {
  conversations: () => api.get("/messages/conversations").then((r) => r.data),
  thread: (id) => api.get(`/messages/conversations/${id}`).then((r) => r.data),
  start: (payload) => api.post("/messages/conversations", payload).then((r) => r.data),
  send: (id, body) =>
    api.post(`/messages/conversations/${id}/messages`, { body }).then((r) => r.data),
};

export const adminApi = {
  overview: () => api.get("/admin/overview").then((r) => r.data),
  users: () => api.get("/admin/users").then((r) => r.data),
  hotels: () => api.get("/admin/hotels").then((r) => r.data),
  updateUser: (id, payload) =>
    api.patch(`/admin/users/${id}`, payload).then((r) => r.data),
  updateHotel: (id, payload) =>
    api.patch(`/admin/hotels/${id}`, payload).then((r) => r.data),
};

export const uploadsApi = {
  image: (file) => {
    const form = new FormData();
    form.append("image", file);
    return api
      .post("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
