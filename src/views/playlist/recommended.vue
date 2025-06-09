<template>
  <div class="recommended-playlist-page">
    <van-nav-bar
      title="推荐歌单"
      left-arrow
      @click-left="goBack"
      fixed
    />
    
    <div class="content-wrapper">
      <!-- 加载中 -->
      <div class="loading-wrapper" v-if="loading">
        <van-loading color="#1989fa" size="24px">加载中...</van-loading>
      </div>
      
      <!-- 歌单列表 -->
      <div class="playlists-container" v-else>
        <van-grid :column-num="2" :border="false" :gutter="10">
          <van-grid-item v-for="playlist in playlists" :key="playlist.id" @click="goToPlaylistDetail(playlist)">
            <div class="playlist-item">
              <div class="playlist-cover">
                <img :src="playlist.picUrl" alt="歌单封面" />
                <div class="play-count">
                  <van-icon name="play-circle-o" />
                  <span>{{ formatPlayCount(playlist.playCount) }}</span>
                </div>
              </div>
              <div class="playlist-name">{{ playlist.name }}</div>
            </div>
          </van-grid-item>
        </van-grid>
        
        <!-- 加载更多 -->
        <div class="load-more" v-if="!isEnd">
          <van-button block plain round type="primary" @click="loadMore" :disabled="loadingMore" :loading="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </van-button>
        </div>
        
        <!-- 无更多数据 -->
        <div class="no-more" v-if="isEnd && playlists.length > 0">
          <p>- 已经到底啦 -</p>
        </div>
        
        <!-- 无数据 -->
        <van-empty v-if="!loading && playlists.length === 0" description="暂无歌单数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getPersonalized } from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const router = useRouter();
const playlists = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const isEnd = ref(false);
const offset = ref(0);
const limit = 20;

// 获取推荐歌单
const fetchRecommendedPlaylists = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const res = await getPersonalized({ limit, offset: offset.value });
    if (res.code === 200) {
      if (isLoadMore) {
        playlists.value = [...playlists.value, ...res.result];
      } else {
        playlists.value = res.result;
      }
      
      // 判断是否还有更多数据
      if (res.result.length < limit) {
        isEnd.value = true;
      } else {
        offset.value += limit;
      }
    } else {
      showToast('获取歌单失败，请稍后重试');
    }
  } catch (error) {
    console.error('获取推荐歌单失败:', error);
    showToast('获取歌单失败，请稍后重试');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loadingMore.value || isEnd.value) return;
  fetchRecommendedPlaylists(true);
};

// 跳转到歌单详情
const goToPlaylistDetail = (playlist) => {
  router.push({
    path: '/playlist-detail',
    query: { id: playlist.id }
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchRecommendedPlaylists();
});
</script>

<style lang="scss" scoped>
.recommended-playlist-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.content-wrapper {
  padding: 56px 12px 20px;
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.playlists-container {
  padding-bottom: 20px;
}

.playlist-item {
  width: 100%;
  
  .playlist-cover {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 8px;
    
    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    
    .play-count {
      position: absolute;
      top: 4px;
      right: 4px;
      background-color: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 12px;
      padding: 2px 6px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      
      .van-icon {
        margin-right: 3px;
      }
    }
  }
  
  .playlist-name {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.3;
    height: 36px;
  }
}

.load-more {
  margin-top: 20px;
}

.no-more {
  margin-top: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
