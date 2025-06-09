<template>
  <div class="album-details">
    <!-- 头部区域 -->
    <van-nav-bar
      title="专辑详情"
      left-arrow
      @click-left="goBack"
      fixed
      placeholder
    />
    
    <!-- 加载中 -->
    <div class="loading-container" v-if="loading">
      <van-loading type="spinner" color="#1989fa" />
    </div>
    
    <!-- 错误提示 -->
    <van-empty v-else-if="error" description="加载失败，请重试" />
    
    <!-- 内容区域 -->
    <template v-else-if="album">
      <!-- 专辑信息 -->
      <div class="album-info">
        <div class="album-cover">
          <img :src="album.picUrl + '?param=400y400'" :alt="album.name">
        </div>
        <div class="album-meta">
          <h2 class="album-name">{{ album.name }}</h2>
          <div class="album-artist" @click="goToArtist(album.artist)">
            <span>歌手：</span>
            <span class="artist-name">{{ album.artist.name }}</span>
          </div>
          <div class="album-publish-time">
            <span>发行：</span>
            <span>{{ formatDate(album.publishTime) }}</span>
          </div>
          <div class="album-company" v-if="album.company">
            <span>发行公司：</span>
            <span>{{ album.company }}</span>
          </div>
        </div>
      </div>
      
      <!-- 专辑描述 -->
      <div class="album-description" v-if="album.description">
        <div class="section-title">专辑介绍</div>
        <div class="description-content" v-html="formatDescription(album.description)"></div>
      </div>
      
      <!-- 歌曲列表 -->
      <div class="songs-container">
        <div class="section-title">歌曲列表</div>
        <div class="play-all" @click="playAll">
          <van-icon name="play-circle-o" size="20" />
          <span>播放全部 ({{ album.songs?.length || 0 }}首)</span>
        </div>
        
        <div class="song-list">
          <div 
            v-for="(song, index) in album.songs" 
            :key="song.id" 
            class="song-item"
            @click="playSong(song)"
          >
            <div class="song-index">{{ index + 1 }}</div>
            <div class="song-info">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">
                {{ formatArtists(song.ar || song.artists) }} - {{ album.name }}
              </div>
            </div>
            <div class="song-actions">
              <van-icon name="play-circle-o" size="20" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showFailToast, showLoadingToast } from 'vant';
import { getAlbum } from '@/apis/music';
import { formatDate } from '@/utils/tools';
import { usePlayerStore } from '@/store/modules/player';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

// 状态管理
const album = ref(null);
const loading = ref(true);
const error = ref(false);

// 获取专辑详情
const fetchAlbumDetails = async () => {
  const id = route.query.id;
  if (!id) {
    showFailToast('专辑ID不能为空');
    error.value = true;
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = false;
  try {
    const res = await getAlbum({ id });
    if (res.code === 200 && res.album) {
      album.value = res.album;
      album.value.songs = res.songs || [];
    } else {
      error.value = true;
      showFailToast('获取专辑详情失败');
    }
  } catch (err) {
    console.error('获取专辑详情失败:', err);
    error.value = true;
    showFailToast('获取专辑详情失败');
  } finally {
    loading.value = false;
  }
};

// 格式化专辑描述
const formatDescription = (description) => {
  if (!description) return '';
  return description.replace(/\n/g, '<br>');
};

// 格式化艺术家名称
const formatArtists = (artists) => {
  if (!artists || !artists.length) return '未知歌手';
  return artists.map(artist => artist.name).join(', ');
};

// 播放单曲
const playSong = async (song) => {
  if (!song) return;
  
  // 补充歌曲信息
  const songInfo = {
    id: song.id,
    name: song.name,
    artist: formatArtists(song.ar || song.artists),
    picUrl: album.value?.picUrl || '',
    duration: song.dt || song.duration || 0
  };
  
  // 使用全局播放器播放
  showLoadingToast({
    message: '正在加载歌曲...',
    forbidClick: true,
  });
  
  playerStore.playSong(songInfo);
};

// 播放全部
const playAll = () => {
  if (!album.value?.songs || album.value.songs.length === 0) {
    showFailToast('暂无可播放歌曲');
    return;
  }
  
  // 播放第一首，并将其他歌曲添加到播放列表
  const songList = album.value.songs.map(song => ({
    id: song.id,
    name: song.name,
    artist: formatArtists(song.ar || song.artists),
    picUrl: album.value.picUrl,
    duration: song.dt || song.duration || 0
  }));
  
  // 清空当前播放列表并添加新列表
  playerStore.clearPlaylist();
  songList.forEach(song => {
    playerStore.playlist.push(song);
  });
  
  // 播放第一首
  if (songList.length > 0) {
    playerStore.currentIndex = 0;
    playerStore.currentSong = songList[0];
    playerStore.playing = true;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 跳转到歌手页面
const goToArtist = (artist) => {
  if (!artist || !artist.id) return;
  router.push({
    path: '/artist',
    query: { id: artist.id }
  });
};

onMounted(() => {
  fetchAlbumDetails();
});
</script>

<style lang="scss" scoped>
.album-details {
  padding-bottom: 60px; // 为底部播放器留出空间
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
  
  .album-info {
    display: flex;
    padding: 20px;
    background-color: var(--van-background-2);
    
    .album-cover {
      width: 120px;
      height: 120px;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .album-meta {
      flex: 1;
      margin-left: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      
      .album-name {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 10px;
        line-height: 1.3;
      }
      
      .album-artist,
      .album-publish-time,
      .album-company {
        font-size: 14px;
        color: var(--van-gray-7);
        margin-bottom: 6px;
        
        .artist-name {
          color: var(--van-primary-color);
        }
      }
    }
  }
  
  .album-description {
    padding: 15px 20px;
    margin-top: 10px;
    background-color: var(--van-background-2);
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .description-content {
      font-size: 14px;
      line-height: 1.6;
      color: var(--van-gray-7);
      margin-top: 10px;
      white-space: pre-wrap;
    }
  }
  
  .songs-container {
    padding: 15px 20px;
    margin-top: 10px;
    background-color: var(--van-background-2);
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .play-all {
      display: flex;
      align-items: center;
      padding: 10px 0;
      color: var(--van-primary-color);
      font-size: 15px;
      border-bottom: 1px solid var(--van-gray-3);
      margin-bottom: 10px;
      
      span {
        margin-left: 5px;
      }
    }
    
    .song-list {
      .song-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--van-gray-2);
        
        &:active {
          background-color: var(--van-gray-1);
        }
        
        .song-index {
          width: 30px;
          text-align: center;
          font-size: 14px;
          color: var(--van-gray-6);
        }
        
        .song-info {
          flex: 1;
          margin-left: 10px;
          overflow: hidden;
          
          .song-name {
            font-size: 15px;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .song-artist {
            font-size: 12px;
            color: var(--van-gray-6);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
        
        .song-actions {
          padding: 0 10px;
          color: var(--van-primary-color);
        }
      }
    }
  }
}
</style>