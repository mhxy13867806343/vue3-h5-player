<template>
  <div class="new-songs-page">
    <van-nav-bar
      title="新音乐"
      left-arrow
      @click-left="goBack"
      fixed
    />
    
    <div class="content-wrapper">
      <!-- 加载中 -->
      <div class="loading-wrapper" v-if="loading">
        <van-loading color="#1989fa" size="24px">加载中...</van-loading>
      </div>
      
      <!-- 歌曲列表 -->
      <div class="songs-container" v-else>
        <div class="song-item" v-for="song in songs" :key="song.id" @click="playSong(song)">
          <div class="song-cover">
            <img :src="song.picUrl" alt="歌曲封面" />
            <van-icon name="play-circle" class="play-icon" />
          </div>
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-artist">
              {{ getArtistName(song) }}
            </div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more" v-if="!isEnd">
          <van-button block plain round type="primary" @click="loadMore" :disabled="loadingMore" :loading="loadingMore">
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </van-button>
        </div>
        
        <!-- 无更多数据 -->
        <div class="no-more" v-if="isEnd && songs.length > 0">
          <p>- 已经到底啦 -</p>
        </div>
        
        <!-- 无数据 -->
        <van-empty v-if="!loading && songs.length === 0" description="暂无新歌数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getPersonalizedNewSong } from '@/apis/music';

const router = useRouter();
const songs = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const isEnd = ref(false);
const offset = ref(0);
const limit = 20;

// 获取推荐新音乐
const fetchNewSongs = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  
  try {
    const res = await getPersonalizedNewSong({ limit, offset: offset.value });
    if (res.code === 200) {
      if (isLoadMore) {
        songs.value = [...songs.value, ...res.result];
      } else {
        songs.value = res.result;
      }
      
      // 判断是否还有更多数据
      if (res.result.length < limit) {
        isEnd.value = true;
      } else {
        offset.value += limit;
      }
    } else {
      showToast('获取新音乐失败，请稍后重试');
    }
  } catch (error) {
    console.error('获取推荐新音乐失败:', error);
    showToast('获取新音乐失败，请稍后重试');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载更多
const loadMore = () => {
  if (loadingMore.value || isEnd.value) return;
  fetchNewSongs(true);
};

// 获取歌手名
const getArtistName = (song) => {
  if (song.song && song.song.artists) {
    return song.song.artists.map(artist => artist.name).join(' / ');
  }
  return '未知歌手';
};

// 播放歌曲
const playSong = (song) => {
  // 这里可以扩展歌曲播放功能
  showToast('播放功能开发中...');
  console.log('播放歌曲:', song);
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchNewSongs();
});
</script>

<style lang="scss" scoped>
.new-songs-page {
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

.songs-container {
  padding-bottom: 20px;
  
  .song-item {
    display: flex;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .song-cover {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .play-icon {
        position: absolute;
        right: 5px;
        bottom: 5px;
        color: #fff;
        font-size: 24px;
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
      }
    }
    
    .song-info {
      flex: 1;
      overflow: hidden;
      
      .song-name {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .song-artist {
        font-size: 13px;
        color: #999;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
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
