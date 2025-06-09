<script setup>
import MiniPlayer from '@/components/MiniPlayer.vue'
import PlayerPage from '@/components/PlayerPage.vue'

// 监听路由变化
const route = useRoute()
const router= useRouter()

// 记录路由变化日志
watch(() => route.path, (newPath) => {
  console.log('路由变化:', newPath)
})
</script>

<template>
  <div class="app-container">
    <!-- 路由视图，使用过渡效果 -->
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta.transition || 'fade'"
        mode="out-in"
      >
        <keep-alive v-if="route.meta.keepAlive">
          <component :is="Component" :key="route.path" />
        </keep-alive>
        <component v-else :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- 全局迷你播放器 -->
    <MiniPlayer />
    
    <!-- 全屏播放页面 -->
    <PlayerPage />
  </div>
</template>

<style lang="scss">
.app-container {
  height: 100vh;
  width: 100%;
  position: relative;
}
.playlist-cover-img{
  width:80px;
  height:80px;
}
.section-container{
  padding: 16px;
  .section-header{
  display:flex;
  justify-content: space-between;
}
}

</style>
