import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'

// 导入全局样式
import './style.css'
import './style/global.scss'

// 导入Vant组件库
import 'vant/lib/index.css'

const app = createApp(App)

// 使用路由
app.use(router)

// 使用状态管理
app.use(pinia)

// 挂载应用
app.mount('#app')
