<template>
  <div class="mini-player" v-show="playerStore.hasSong">
    <div class="mini-player-content" @click="playerStore.togglePlayerPage">
      <div class="song-cover">
        <img v-if="playerStore.currentSong?.picUrl" :src="playerStore.currentSong.picUrl + '?param=60y60'" />
        <div v-else class="default-cover">
          <van-icon name="music-o" size="24" />
        </div>
      </div>
      <div class="song-info">
        <div class="song-name">{{ playerStore.currentSong?.name || '未知歌曲' }}</div>
        <div class="song-artist">{{ playerStore.currentSong?.artist || '未知歌手' }}</div>
      </div>
    </div>
    
    <div class="player-controls">
      <van-icon 
        :name="playerStore.playing ? 'pause-circle-o' : 'play-circle-o'" 
        size="30" 
        @click.stop="playerStore.togglePlay" 
      />
      <van-icon name="play-list-o" size="24" @click.stop="showPlaylist = true" />
    </div>
    
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${playerStore.progress}%` }"></div>
    </div>
    
    <!-- 音频元素 -->
    <audio
      ref="audioRef"
      :src="playerStore.currentSong?.url"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @canplay="onCanPlay"
    ></audio>
    
    <!-- 播放列表弹窗 -->
    <van-popup
      v-model:show="showPlaylist"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="playlist-header">
        <div class="title">
          <span>播放列表</span>
          <span class="count">({{ playerStore.playlist.length }})</span>
        </div>
        <div class="actions">
          <van-icon name="delete-o" @click="clearPlaylist" />
        </div>
      </div>
      
      <div class="playlist-content">
        <van-cell-group>
          <van-cell 
            v-for="(song, index) in playerStore.playlist" 
            :key="song.id"
            :title="song.name"
            :label="song.artist"
            :class="{ active: index === playerStore.currentIndex }"
            @click="playSongByIndex(index)"
          >
            <template #right-icon>
              <van-icon name="cross" @click.stop="removeSongFromList(index)" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <div class="playlist-footer">
        <van-button block round @click="showPlaylist = false">关闭</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { showToast } from 'vant';
import { usePlayerStore } from '@/store/modules/player';
import { formatTime } from '@/utils/tools';

const playerStore = usePlayerStore();
const audioRef = ref(null);
const showPlaylist = ref(false);

// 初始化
onMounted(() => {
  if (playerStore.playing) {
    playAudio();
  }
});

// 监听播放状态变化
watch(() => playerStore.playing, (newVal) => {
  if (newVal) {
    playAudio();
  } else {
    pauseAudio();
  }
});

// 监听当前歌曲变化
watch(() => playerStore.currentSong, (newVal) => {
  if (newVal) {
    // 重置进度
    playerStore.updateCurrentTime(0);
    // 延迟播放，确保URL已加载
    setTimeout(() => {
      playAudio();
    }, 100);
  }
});

// 播放音频
const playAudio = () => {
  if (!playerStore.currentSong?.url) {
    showToast('歌曲链接不可用');
    return;
  }
  
  const audio = audioRef.value;
  if (audio) {
    audio.play().catch(err => {
      showToast('播放失败，请稍后再试');
      playerStore.playing = false;
    });
  }
};

// 暂停音频
const pauseAudio = () => {
  const audio = audioRef.value;
  if (audio) {
    audio.pause();
  }
};

// 更新播放进度
const onTimeUpdate = () => {
  const audio = audioRef.value;
  if (audio) {
    playerStore.updateCurrentTime(audio.currentTime);
  }
};

// 歌曲播放结束
const onEnded = () => {
  // 根据播放模式决定下一步操作
  switch (playerStore.playMode) {
    case 1: // 列表循环
      playerStore.nextSong();
      break;
    case 2: // 单曲循环
      const audio = audioRef.value;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      break;
    case 3: // 随机播放
      const randomIndex = Math.floor(Math.random() * playerStore.playlist.length);
      playerStore.currentIndex = randomIndex;
      playerStore.currentSong = playerStore.playlist[randomIndex];
      break;
    default:
      playerStore.nextSong();
  }
};

// 歌曲准备就绪
const onCanPlay = () => {
  const audio = audioRef.value;
  if (audio) {
    playerStore.updateDuration(audio.duration);
  }
};

// 切换到指定索引的歌曲
const playSongByIndex = (index) => {
  if (index === playerStore.currentIndex && playerStore.playing) {
    // 如果点击当前播放歌曲，则暂停
    playerStore.togglePlay();
  } else {
    // 否则切换到指定歌曲
    playerStore.currentIndex = index;
    playerStore.currentSong = playerStore.playlist[index];
    playerStore.playing = true;
  }
};

// 从播放列表中移除歌曲
const removeSongFromList = (index) => {
  const currentIndex = playerStore.currentIndex;
  
  // 移除歌曲
  playerStore.playlist.splice(index, 1);
  
  // 如果删除的是当前播放的歌曲
  if (index === currentIndex) {
    if (playerStore.playlist.length > 0) {
      // 如果还有歌曲，播放下一首
      const nextIndex = index < playerStore.playlist.length ? index : 0;
      playerStore.currentIndex = nextIndex;
      playerStore.currentSong = playerStore.playlist[nextIndex];
    } else {
      // 如果没有歌曲了，清空播放器
      playerStore.currentSong = null;
      playerStore.currentIndex = -1;
      playerStore.playing = false;
    }
  } else if (index < currentIndex) {
    // 如果删除的歌曲在当前播放歌曲前面，修正索引
    playerStore.currentIndex--;
  }
};

// 清空播放列表
const clearPlaylist = () => {
  playerStore.clearPlaylist();
  showPlaylist.value = false;
};
</script>

<style lang="scss" scoped>
.mini-player {
  position: fixed;
  bottom: 50px; // 留出底部导航栏高度
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 999;
  
  .mini-player-content {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
  }
  
  .song-cover {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .default-cover {
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $text-color-light;
    }
  }
  
  .song-info {
    flex: 1;
    overflow: hidden;
    
    .song-name {
      font-size: 14px;
      color: $text-color;
      margin-bottom: 4px;
      width: 100%;
      @include text-ellipsis;
    }
    
    .song-artist {
      font-size: 12px;
      color: $text-color-light;
      width: 100%;
      @include text-ellipsis;
    }
  }
  
  .player-controls {
    display: flex;
    align-items: center;
    
    .van-icon {
      margin-left: 16px;
      color: $primary-color;
    }
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #eee;
    
    .progress {
      height: 100%;
      background-color: $primary-color;
      transition: width 0.1s linear;
    }
  }
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid $border-color;
  
  .title {
    font-size: 16px;
    font-weight: bold;
    
    .count {
      font-size: 14px;
      color: $text-color-light;
      font-weight: normal;
      margin-left: 4px;
    }
  }
  
  .actions {
    .van-icon {
      font-size: 18px;
      color: $text-color-light;
    }
  }
}

.playlist-content {
  height: calc(100% - 120px);
  overflow-y: auto;
  
  .van-cell.active {
    color: $primary-color;
    
    .van-cell__label {
      color: $primary-color;
    }
    
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: $primary-color;
    }
  }
}

.playlist-footer {
  padding: 16px;
  border-top: 1px solid $border-color;
  
  .van-button {
    background-color: $primary-color;
    color: #fff;
    font-size: 16px;
  }
}
</style>
