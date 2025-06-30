import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 액세스 토큰이 만료된 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await axios.post(`${baseURL}/api/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (error) {
        // 리프레시 토큰도 만료된 경우
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
) 