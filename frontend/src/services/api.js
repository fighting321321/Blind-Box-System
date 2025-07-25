import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:7001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 重定向到登录页面
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 盲盒相关API
export const blindBoxAPI = {
  // 获取所有盲盒
  getAllBlindBoxes: () => api.get('/blind-boxes'),

  // 获取盲盒详情
  getBlindBoxById: (id) => api.get(`/blind-boxes/${id}`),

  // 抽取盲盒
  drawBlindBox: (userId, blindBoxId) =>
    api.post('/draw-blind-box', { userId, blindBoxId }),

  // 获取用户订单
  getUserOrders: (userId) => api.get(`/orders?userId=${userId}`),
}

// 用户盲盒库相关API
export const userLibraryAPI = {
  // 添加盲盒到用户库
  addToLibrary: (userId, blindBoxId, quantity = 1, note = '') =>
    api.post('/library', { userId, blindBoxId, quantity, note }),

  // 获取用户的盲盒库
  getUserLibrary: (userId) => api.get(`/library?userId=${userId}`),

  // 更新库项目
  updateLibraryItem: (itemId, updateData) =>
    api.put(`/library/${itemId}`, updateData),

  // 从用户库中移除盲盒
  removeFromLibrary: (itemId, userId) =>
    api.delete(`/library/${itemId}?userId=${userId}`),

  // 获取用户库统计信息
  getUserLibraryStats: (userId) => api.get(`/library/stats?userId=${userId}`),
}

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getUserInfo: (uid) => api.get(`/get_user?uid=${uid}`),

  // 用户登录
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  // 用户注册
  register: (userData) =>
    api.post('/auth/register', userData),

  // 验证token
  validateToken: (token) =>
    api.post('/auth/validate', { token }),
}

export default api
