import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({})
  // 登录状态
  const isLogin = ref(false)
  // token
  const token = ref('')

  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
  }

  // 设置登录状态
  function setLoginState(state) {
    isLogin.value = state
  }

  // 设置token
  function setToken(value) {
    token.value = value
    localStorage.setItem('token', value)
  }

  // 获取本地token
  function getLocalToken() {
    const localToken = localStorage.getItem('token')
    if (localToken) {
      token.value = localToken
      return localToken
    }
    return null
  }

  // 登出
  function logout() {
    userInfo.value = {}
    isLogin.value = false
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    isLogin,
    token,
    setUserInfo,
    setLoginState,
    setToken,
    getLocalToken,
    logout
  }
})
