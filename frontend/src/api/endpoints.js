import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const classesApi = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  enroll: (classId, studentId) => api.post(`/classes/${classId}/enroll`, { studentId }),
  unenroll: (classId, studentId) => api.delete(`/classes/${classId}/unenroll/${studentId}`),
};

export const subjectsApi = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const attendanceApi = {
  mark: (data) => api.post('/attendance', data),
  getByClass: (classId, params) => api.get(`/attendance/class/${classId}`, { params }),
  getByStudent: (studentId, params) => api.get(`/attendance/student/${studentId}`, { params }),
  getSummary: (classId, params) => api.get(`/attendance/summary/${classId}`, { params }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};
