import { createPinia } from 'pinia'
import { markRaw } from 'vue'
import router from '../router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()

// 添加路由到pinia
pinia.use(({ store }) => {
  store.$router = markRaw(router)
})

// 添加持久化插件
pinia.use(piniaPluginPersistedstate)

export default pinia
