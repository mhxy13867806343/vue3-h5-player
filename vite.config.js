import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// 路径别名解析函数
function pathResolve(dir) {
  return resolve(process.cwd(), '.', dir)
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // 项目根目录
    root: process.cwd(),
    
    // 项目部署的基础路径
    base: env.VITE_PUBLIC_PATH || '/',
    
    // 环境变量前缀
    envPrefix: ['VITE_'],
    
    // 解析配置
    resolve: {
      // 路径别名
      alias: {
        '@': pathResolve('src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
      },
      // 导入时想要省略的扩展名列表
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    
    // CSS 相关配置
    css: {
      // CSS 预处理器配置
      preprocessorOptions: {
        scss: {
          // 全局引入变量和 mixin
          additionalData: `
            @import "@/style/variables.scss";
            @import "@/style/mixins.scss";
          `,
        },
      },
      // PostCSS配置已移动到postcss.config.js文件中
    },
    
    // 服务器选项
    server: {
      host: '0.0.0.0',
      port: 5173,
      // 开发服务器代理配置
      proxy: {
        '^/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    // 构建选项
    build: {
      outDir: 'dist',
      // 生产环境移除 console
      minify: 'terser',
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: env.VITE_DROP_CONSOLE === 'true',
          drop_debugger: true,
        },
      },
      // chunk 大小警告的限制
      chunkSizeWarningLimit: 1200,
    },
    
    // 插件配置
    plugins: [
      // Vue 3 插件
      vue(),
      
      // 自动导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables', 'src/hooks', 'src/store/modules'],
        vueTemplate: true,
      }),
      
      // 组件自动注册
      Components({
        resolvers: [VantResolver()],
        dts: 'src/components.d.ts',
        dirs: ['src/components'],
      }),
    ],
  }
})
