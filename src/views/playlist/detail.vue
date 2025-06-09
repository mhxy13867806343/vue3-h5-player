<script setup>
import { showToast, showLoadingToast, closeToast } from 'vant';
import { ShareSheet } from 'vant';
import { getPlaylistDetail, getSongDetail } from '@/apis/music';
import { formatPlayCount, formatTime } from '@/utils/tools';
import { usePlayerStore } from '@/store/modules/player';

const route = useRoute();
const router = useRouter();
// 来源路由
const fromRoute=ref("")
// 歌单ID
const playlistId = ref('');
// 歌单详情
const playlistDetail = ref(null);
// 歌曲列表
const songs = ref([]);
// 加载状态
const loading = ref(false);
// 歌曲ID列表
const trackIds = ref([]);
// 分享面板显示状态
const showShare = ref(false);
// 是否来自分享链接
const isFromShare = ref(false);

// 跳转到评论页面
const goToComments = () => {
  if (!playlistId.value) return;
  
  router.push({
    path: '/comment/playlist',
    query: {
      id: playlistId.value
    }
  });
};

// 播放器状态管理
const playerStore = usePlayerStore();

// 分享选项
const shareOptions = [
  { name: '复制链接', icon: 'link' }
];

// 获取歌单详情
const fetchPlaylistDetail = async () => {
  if (!playlistId.value) return;
  
  loading.value = true;
  showLoadingToast({
    message: '加载中...',
    forbidClick: true,
    duration: 0
  });
  
  try {
    // 调用歌单详情API
    const res = await getPlaylistDetail({ id: playlistId.value });
    
    if (!res || !res.playlist) {
      throw new Error('获取歌单详情失败');
    }
    
    // 保存歌单详情数据
    playlistDetail.value = res.playlist;
    
    // 获取所有歌曲ID
    if (res.playlist.trackIds && res.playlist.trackIds.length > 0) {
      trackIds.value = res.playlist.trackIds.map(item => item.id);
    }
    
    // 获取部分歌曲详情信息
    if (res.playlist.tracks && res.playlist.tracks.length > 0) {
      songs.value = res.playlist.tracks;
    }
    
    // 如果tracks不完整但有trackIds，则获取完整歌曲信息
    if (trackIds.value.length > songs.value.length) {
      // 歌曲数量太多时分批请求，每次最多获取500首
      const batchSize = 500;
      const fetchPromises = [];
      
      for (let i = 0; i < trackIds.value.length; i += batchSize) {
        const batchIds = trackIds.value.slice(i, i + batchSize);
        fetchPromises.push(getSongDetail({ ids: batchIds.join(',') }));
      }
      
      const results = await Promise.all(fetchPromises);
      const allSongs = results.flatMap(result => result.songs || []);
      
      if (allSongs.length > 0) {
        songs.value = allSongs;
      }
    }
    
    closeToast();
    loading.value = false;
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    showToast('获取歌单详情失败');
    loading.value = false;
    closeToast();
  }
};

// 播放全部歌曲
const playAll = async () => {
  if (songs.value.length === 0) {
    showToast('没有可播放的歌曲');
    return;
  }
  
  try {
    // 将歌单中的所有歌曲添加到播放列表
    const playlist = songs.value.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => a.name).join('/'),
      album: song.al.name,
      duration: song.dt,
      picUrl: song.al.picUrl
    }));
    
    // 清空当前播放列表并添加新歌单
    playerStore.clearPlaylist();
    
    // 添加歌曲到播放列表并播放第一首
    if (playlist.length > 0) {
      // 获取第一首歌曲的URL
      const firstSong = playlist[0];
      playerStore.playlist = playlist;
      playerStore.currentIndex = 0;
      playerStore.currentSong = firstSong;
      playerStore.playing = true;
      
      showToast('已添加到播放列表');
    }
  } catch (error) {
    console.error('播放失败:', error);
    showToast('播放失败');
  }
};

// 收藏歌单
const collectPlaylist = () => {
  showToast('收藏成功');
};

// 播放单曲
const playSong = (song) => {
  try {
    const songInfo = {
      id: song.id,
      name: song.name,
      artist: song.ar.map(a => a.name).join('/'),
      album: song.al.name,
      duration: song.dt,
      picUrl: song.al.picUrl
    };
    
    playerStore.playSong(songInfo);
  } catch (error) {
    console.error('播放失败:', error);
    showToast('播放失败');
  }
};

// 判断并处理返回逻辑
const goBack = () => {
  router.back()
};

// 打开分享面板
const openSharePanel = () => {
  showShare.value = true;
};

// 处理分享选择
const onSelectShare = (option) => {
  if (option.name === '复制链接') {
    // 生成当前页面分享链接，带上s=1参数标记分享来源
    const currentUrl = window.location.href;
    const shareUrl = currentUrl.includes('?') ? 
                     `${currentUrl}&s=1` : 
                     `${currentUrl}?s=1`;
    
    // 使用浏览器API复制链接
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showToast('链接已复制');
        })
        .catch(err => {
          console.error('复制失败:', err);
          showToast('复制链接失败，请手动复制');
        });
    } else {
      // 兼容旧浏览器
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast('链接已复制');
      } catch (err) {
        console.error('复制失败:', err);
        showToast('复制链接失败，请手动复制');
      }
      document.body.removeChild(textarea);
    }
  }
  showShare.value = false;
};

// 组件挂载时
onMounted(() => {
  console.log('歌单详情页挂载', route.query);
  // 检查是否有歌单ID参数（可能在query或params中）
  if (route.query.id) {
    playlistId.value = route.query.id;
    fetchPlaylistDetail();
  } else if (route.params.id) {
    // 兼容可能使用params的情况
    playlistId.value = route.params.id;
    fetchPlaylistDetail();
  } else {
    console.error('没有歌单ID参数');
    showToast('没有歌单ID参数');
  }

});
</script>

<template>
  <div>
    <div class="playlist-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button" @click="goBack">
      <van-icon name="arrow-left" size="20" color="#fff" />
    </div>
    
    <!-- 歌单信息 -->
    <div class="playlist-info" v-if="playlistDetail">
      <div class="playlist-header">
        <div class="cover">
          <img :src="playlistDetail.coverImgUrl" :alt="playlistDetail.name">
          <div class="play-count">
            <van-icon name="play-circle-o" />
            <span>{{ formatPlayCount(playlistDetail.playCount) }}</span>
          </div>
        </div>
        <div class="info">
          <div class="name">{{ playlistDetail.name }}</div>
          <div class="creator">
            <img :src="playlistDetail.creator.avatarUrl" class="avatar">
            <span>{{ playlistDetail.creator.nickname }}</span>
          </div>
          <div class="description" v-if="playlistDetail.description">{{ playlistDetail.description }}</div>
          <div class="tags" v-if="playlistDetail.tags && playlistDetail.tags.length > 0">
            <van-tag plain type="primary" v-for="(tag, index) in playlistDetail.tags" :key="index">
              {{ tag }}
            </van-tag>
          </div>
        </div>
      </div>
      
      <div class="playlist-actions">
        <div class="action collect" @click="collectPlaylist">
          <van-icon name="like-o" size="18" />
          <span>{{ formatPlayCount(playlistDetail.subscribedCount) }}</span>
        </div>
        <div class="action comment" @click="goToComments">
          <van-icon name="comment-o" size="18" />
          <span>评论 ({{ formatPlayCount(playlistDetail.commentCount)}})</span>
        </div>
        <div class="action share" @click="openSharePanel">
          <van-icon name="share-o" size="18" />
          <span>分享</span>
        </div>
      </div>
    </div>
    
    <!-- 歌曲列表 -->
    <div class="song-list-container">
      <div class="song-list-header">
        <div class="play-all" @click="playAll">
          <van-icon name="play-circle-o" size="20" />
          <span>播放全部<small> ({{ songs.length }}首)</small></span>
        </div>
        <div class="collect-all">
          <van-icon name="plus" size="14" />
          <span>收藏</span>
        </div>
      </div>
      
      <div class="song-list">
        <div class="song-item" v-for="(song, index) in songs" :key="song.id">
          <div class="index">{{ index + 1 }}</div>
          <div class="song-info">
            <div class="song-name">{{ song.name }}</div>
            <div class="song-detail">
              <van-tag type="primary" size="mini" v-if="index < 3">热门</van-tag>
              <span>{{ song.ar?.map(a => a.name).join('/') }} - {{ song.al?.name }}</span>
            </div>
          </div>
          <div class="song-actions">
            <van-icon name="play-circle-o" @click="playSong(song)" />
            <van-icon name="ellipsis" />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 分享面板 -->
  <van-share-sheet
    v-model:show="showShare"
    title="分享歌单"
    :options="shareOptions"
    @select="onSelectShare"
  />
  </div>
</template>

<style lang="scss" scoped>
.playlist-detail-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 50px;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 10px;
  z-index: 999;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
}

.playlist-info {
  position: relative;
  padding: 20px 15px;
  color: #fff;
  background: linear-gradient(to bottom, $primary-color, $bg-color);
  
  .playlist-header {
    display: flex;
    margin-top: 40px;
    
    .cover {
      width: 120px;
      height: 120px;
      margin-right: 15px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .creator {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 6px;
        }
        
        span {
          font-size: 14px;
        }
      }
      
      .description {
        font-size: 12px;
        opacity: 0.8;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
  
  .playlist-actions {
    display: flex;
    justify-content: space-around;
    padding: 15px 0 5px;
    
    .action {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      span {
        margin-top: 5px;
        font-size: 12px;
      }
    }
  }
}

.song-list-container {
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  padding: 0 15px;
  
  .song-list-header {
    padding: 15px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $border-color;
    
    .play-all {
      display: flex;
      align-items: center;
      
      span {
        margin-left: 8px;
        font-weight: 500;
        
        small {
          font-weight: normal;
          color: $text-color-light;
        }
      }
    }
    
    .collect-all {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 20px;
      background-color: $bg-color;
      
      span {
        margin-left: 4px;
        font-size: 14px;
      }
    }
  }
  
  .song-list {
    .song-item {
      display: flex;
      padding: 12px 0;
      align-items: center;
      border-bottom: 1px solid $border-color-light;
      
      .index {
        width: 30px;
        text-align: center;
        font-size: 14px;
        color: $text-color-light;
      }
      
      .song-info {
        flex: 1;
        padding-right: 10px;
        overflow: hidden;
        
        .song-name {
          font-size: 15px;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .song-detail {
          font-size: 12px;
          color: $text-color-light;
          @include text-ellipsis;
          display: flex;
          align-items: center;
          
          .van-tag {
            margin-right: 5px;
            transform: scale(0.8);
            transform-origin: left center;
          }
        }
      }
      
      .song-actions {
        display: flex;
        .van-icon {
          padding: 0 8px;
          font-size: 18px;
          color: $text-color-light;
        }
      }
    }
  }
}
</style>
