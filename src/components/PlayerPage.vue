<template>
  <van-popup
    v-model:show="playerStore.showPlayerPage"
    position="bottom"
    round
    :style="{ height: '100%' }"
    class="player-page"
  >
    <div class="player-container">
      <!-- 头部控制栏 -->
      <div class="player-header">
        <van-icon name="arrow-down" @click="playerStore.togglePlayerPage" />
        <div class="player-title">
          <div class="song-name">{{ playerStore.currentSong?.name || '未知歌曲' }}</div>
          <div class="song-artist">{{ playerStore.currentSong?.artist || '未知歌手' }}</div>
        </div>
        <van-icon name="share-o" />
      </div>
      
      <!-- 唱片旋转效果 -->
      <div class="player-disc">
        <div class="disc-container" :class="{ rotating: playerStore.playing }">
          <div class="disc-wrapper">
            <img 
              v-if="playerStore.currentSong?.picUrl" 
              :src="playerStore.currentSong.picUrl + '?param=400y400'" 
              class="disc-image"
            />
            <div v-else class="default-cover">
              <van-icon name="music" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 歌词区域 -->
      <div class="player-lyrics">
        <div class="lyrics-placeholder">暂无歌词</div>
      </div>
      
      <!-- 播放控制区 -->
      <div class="player-controls">
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="time">{{ formatTime(playerStore.currentTime, false) }}</div>
          <div class="bar-wrapper">
            <div class="bar-bg"></div>
            <div class="bar-progress" :style="{ width: `${playerStore.progress}%` }"></div>
          </div>
          <div class="time">{{ formatTime(playerStore.duration, false) }}</div>
        </div>
        
        <!-- 控制按钮 -->
        <div class="control-buttons">
          <van-icon 
            :name="playModeIcon" 
            size="24" 
            @click="playerStore.changePlayMode" 
          />
          <van-icon name="arrow-left" size="24" @click="playerStore.prevSong" />
          <div class="play-button" @click="playerStore.togglePlay">
            <van-icon :name="playerStore.playing ? 'pause' : 'play'" size="30" />
          </div>
          <van-icon name="arrow-right" size="24" @click="playerStore.nextSong" />
          <van-icon name="play-list-o" size="24" @click="showPlaylist = true" />
        </div>
      </div>
    </div>
    
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
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue';
import { showToast } from 'vant';
import { usePlayerStore } from '@/store/modules/player';
import { formatTime } from '@/utils/tools';

const playerStore = usePlayerStore();
const showPlaylist = ref(false);

// 播放模式图标
const playModeIcon = computed(() => {
  switch (playerStore.playMode) {
    case 1: // 列表循环
      return 'replay';
    case 2: // 单曲循环
      return 'replay';
    case 3: // 随机播放
      return 'shuffle';
    default:
      return 'replay';
  }
});

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
.player-page {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  
  .player-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    color: #fff;
    
    .player-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      
      .player-title {
        flex: 1;
        text-align: center;
        
        .song-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .song-artist {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          @include text-ellipsis;
        }
      }
      
      .van-icon {
        font-size: 24px;
      }
    }
    
    .player-disc {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 30px;
      
      .disc-container {
        width: 300px;
        height: 300px;
        position: relative;
        
        &.rotating {
          .disc-wrapper {
            animation: rotate 20s linear infinite;
          }
        }
        
        .disc-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          
          &:after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.3) 70%);
            border-radius: 50%;
          }
          
          .disc-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .default-cover {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            
            .van-icon {
              font-size: 80px;
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }
      }
    }
    
    .player-lyrics {
      height: 60px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .lyrics-placeholder {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }
    }
    
    .player-controls {
      .progress-bar {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          width: 40px;
        }
        
        .bar-wrapper {
          flex: 1;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          margin: 0 10px;
          position: relative;
          
          .bar-bg {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 100%;
            border-radius: 2px;
          }
          
          .bar-progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background-color: $primary-color;
            border-radius: 2px;
          }
        }
      }
      
      .control-buttons {
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .play-button {
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
