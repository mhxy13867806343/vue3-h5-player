import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '../store/modules/user'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从Pinia获取token
    const userStore = useUserStore()
    const token = userStore.token || userStore.getLocalToken()
    
    // 如果有token则添加到请求头
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
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果接口返回的code存在且不是200，则判定为错误
    if (res.code !== undefined && res.code !== 200) {
      showToast({
        message: res.msg || res.message || '接口请求失败',
        type: 'fail',
        duration: 2000,
      })
      
      // 处理401错误（未授权）
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        // 跳转到登录页
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.msg || res.message || '接口请求失败'))
    } else {
      // 如果code是200或不存在code，直接返回数据
      // 网易云音乐API返回数据结构各不相同，需要兼容处理
      return res
    }
  },
  (error) => {
    console.error('请求错误', error)
    // 处理网络错误
    showToast({
      message: error.message || '网络请求失败',
      type: 'fail',
      duration: 2000,
    })
    
    return Promise.reject(error)
  }
)

/**
 * get请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export function get(url, params = {}, options = {}) {
  return service({
    url,
    method: 'get',
    params,
    ...options,
  })
}

/**
 * post请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
export function post(url, data = {}, options = {}) {
  return service({
    url,
    method: 'post',
    data,
    ...options,
  })
}

/**
 * 带加载状态的请求
 * @param {Function} requestFn 请求函数
 * @param {String} message 加载提示文案
 * @returns {Promise}
 */
export function loadingRequest(requestFn, message = '加载中...') {
  showLoadingToast({
    message,
    forbidClick: true,
    duration: 0,
  })
  
  return requestFn().finally(() => {
    closeToast()
  })
}

export default service
