<template>
  <div class="similar-playlists">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="相似歌单"
      left-arrow
      fixed
      placeholder
      z-index="999"
      @click-left="onClickLeft"
    >
      <template #right v-if="originalPlaylistName">
        <van-icon name="arrow-left" />来自:{{ originalPlaylistName }}
      </template>
    </van-nav-bar>
    
    <!-- 歌单列表 -->
    <div class="playlist-container">
      <!-- 加载状态 -->
      <div class="loading-container" v-if="loading">
        <van-loading type="spinner" color="#1989fa" />
      </div>
      
      <!-- 空状态 -->
      <div class="empty-state" v-else-if="playlists.length === 0">
        <van-empty description="暂无相似歌单" />
      </div>
      
      <!-- 歌单列表 -->
      <div class="playlist-list" v-else>
        <div 
          class="playlist-item" 
          v-for="playlist in playlists" 
          :key="playlist.id"
          @click="goToPlaylistDetail(playlist.id)"
        >
          <div class="cover-container">
            <img :src="playlist.coverImgUrl" :alt="playlist.name" class="cover" />
            <div class="play-count">
              <van-icon name="play-circle-o" />
              <span>{{ formatPlayCount(playlist.playCount) }}</span>
            </div>
          </div>
          <div class="info">
            <div class="name">{{ playlist.name }}</div>
            <div class="tracks">{{ playlist.trackCount }}首歌曲</div>
            <div class="creator">
              <span>by {{ playlist.creator?.nickname }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getSimiPlaylist } from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const route = useRoute();
const router = useRouter();

// 歌单ID
const playlistId = ref('');
// 原歌单名称
const originalPlaylistName = ref('');
// 相似歌单列表
const playlists = ref([]);
// 加载状态
const loading = ref(false);

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 获取相似歌单
const fetchSimiPlaylists = async () => {
  if (!playlistId.value) {
    return;
  }
  
  loading.value = true;
  
  try {
    const res = await getSimiPlaylist({ id: playlistId.value });
    
    if (res.code === 200) {
      if (res.playlists && res.playlists.length > 0) {
        playlists.value = res.playlists;
      } else {
        showToast('没有找到相似歌单');
      }
    } else {
      showToast('获取相似歌单失败');
    }
  } catch (error) {
    console.error('获取相似歌单失败:', error);
    showToast('获取相似歌单失败');
  } finally {
    loading.value = false;
  }
};

// 跳转到歌单详情
const goToPlaylistDetail = (id) => {
  router.push({
    path: '/playlist-detail',
    query: { id }
  });
};

// 页面初始化
onMounted(() => {
  // 获取路由参数
  if (route.query.id) {
    playlistId.value = route.query.id;
    originalPlaylistName.value = route.query.name || '';
    
    // 获取相似歌单
    fetchSimiPlaylists();
  } else {
    showToast('参数错误');
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.similar-playlists {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  padding: 60px 0;
}

.playlist-container {
  padding: 10px 15px;
  
  .playlist-list {
    .playlist-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      
      &:active {
        background: #f9f9f9;
      }
      
      .cover-container {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        margin-right: 12px;
        
        .cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .play-count {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 12px;
          padding: 2px 4px;
          display: flex;
          align-items: center;
          
          .van-icon {
            font-size: 12px;
            margin-right: 2px;
          }
        }
      }
      
      .info {
        flex: 1;
        overflow: hidden;
        
        .name {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .tracks {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .creator {
          font-size: 12px;
          color: #999;
          
          span {
            background-color: #f5f5f5;
            padding: 2px 6px;
            border-radius: 10px;
          }
        }
      }
    }
  }
}

/* 调整导航栏样式 */
:deep(.van-nav-bar__title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.van-nav-bar__right) {
  font-size: 12px;
  color: #666;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
