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
        </div>
      
        <!-- 多播放列表选择器 -->
        <div v-if="playerStore.hasMultiplePlaylists" class="playlist-selector">
          <van-dropdown-menu>
            <van-dropdown-item v-model="activePlaylistId" :options="playlistOptions" @change="onPlaylistChange" />
          </van-dropdown-menu>
        </div>
        
        <div class="right-actions">
          <van-icon name="plus" @click="showCreatePlaylist = true" />
          <van-icon name="bars" @click="showPlaylist = true" />
        </div>
      </div>
    
      <div class="song-info">
      <div class="cover">
        <img 
          v-if="playerStore.currentSong?.picUrl" 
          :src="playerStore.currentSong.picUrl + '?param=300y300'" 
          :class="{ rotating: playerStore.playing }"
        />
        <div v-else class="default-cover">
          <van-icon name="music-o" size="60" />
        </div>
      </div>
      
      <div class="info">
        <h1 class="name">{{ playerStore.currentSong?.name || '未知歌曲' }}</h1>
        <p class="artist">{{ playerStore.currentSong?.artist || '未知歌手' }}</p>
        
        <!-- 显示当前播放模式和次数 -->
        <div class="play-status">
          <span class="mode-text">模式: {{ playerStore.playModeText }}</span>
          <span v-if="playerStore.playCount > 0" class="count-text">
            当前播放: {{ playerStore.currentSongPlayCount }}/{{ playerStore.playCount }}  
          </span>
        </div>
      </div>
    </div>
    
    <div class="progress">
      <span class="current-time">{{ formatTime(playerStore.currentTime) }}</span>
      <div class="progress-bar" @click="onProgressBarClick">
        <div class="played" :style="{ width: `${playerStore.progress}%` }"></div>
      </div>
      <span class="total-time">{{ formatTime(playerStore.duration) }}</span>
    </div>
    
    <div class="controls">
      <div class="mode" @click="playerStore.changePlayMode" @touchstart="startLongPress" @touchend="endLongPress" @touchcancel="endLongPress">
        <van-icon :name="playModeIcon" />
      </div>
      
      <div class="main-controls">
        <van-icon name="arrow-left" size="24" @click="playerStore.prevSong" />
        <van-icon 
          :name="playerStore.playing ? 'pause-circle' : 'play-circle'" 
          size="50" 
          @click="playerStore.togglePlay" 
        />
        <van-icon name="arrow-right" size="24" @click="playerStore.nextSong" />
      </div>
      
      <div class="playlist-btn" @click="showPlaylistManagement = true">
        <van-badge :content="playerStore.playlists.length" max="99">
          <van-icon name="apps-o" size="24" />
        </van-badge>
      </div>
    </div>
    
    <!-- 播放列表弹窗 -->
    <van-popup
      v-model:show="showPlaylist"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="playlist-header">
        <div class="title">
          <span>播放列表</span>
          <span class="count">({{ currentPlaylist?.songs?.length || 0 }})</span>
        </div>
        <van-icon name="delete-o" @click="playerStore.clearActivePlaylist()" />
      </div>
      
      <div class="playlist-content">
        <van-cell-group>
          <van-cell 
            v-for="(song, index) in currentPlaylist?.songs" 
            :key="song.id"
            :title="song.name"
            :label="song.artist"
            :class="{ active: index === playerStore.currentIndex && activePlaylistId === playerStore.activePlaylistId }"
            @click="playSongByIndex(index)"
          >
            <template #right-icon>
              <van-icon name="cross" @click.stop="removeSongFromList(index)" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <div class="playlist-footer">
        <div class="play-mode-info">
          <span @click="playerStore.changePlayMode()">播放模式：{{ playerStore.playModeText }}</span>
          <span v-if="playerStore.showPlayCountText" class="play-count">播放次数：{{ playerStore.playCount }}</span>
        </div>
        <van-button block round @click="showPlaylist = false">关闭</van-button>
      </div>
    </van-popup>
    
    <!-- 播放列表管理弹窗 -->
    <van-popup
      v-model:show="showPlaylistManagement"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="playlist-header">
        <div class="title">播放列表管理</div>
        <van-icon name="plus" @click="showCreatePlaylist = true" />
      </div>
      
      <div class="playlist-manage-content">
        <van-cell-group>
          <van-cell 
            v-for="playlist in playerStore.playlists" 
            :key="playlist.id"
            :title="playlist.name"
            :label="`${playlist.songs.length} 首歌曲`"
            :class="{ active: playlist.id === playerStore.activePlaylistId }"
            @click="selectPlaylist(playlist.id)"
          >
            <template #right-icon>
              <van-icon 
                v-if="playlist.id !== 'default'" 
                name="delete-o" 
                @click.stop="removePlaylist(playlist.id)" 
              />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      
      <div class="playlist-footer">
        <van-button block round @click="showPlaylistManagement = false">关闭</van-button>
      </div>
    </van-popup>
    
    <!-- 创建新播放列表弹窗 -->
    <van-popup
      v-model:show="showCreatePlaylist"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <div class="create-playlist">
        <div class="setting-title">创建新的播放列表</div>
        
        <van-field 
          v-model="newPlaylistName" 
          placeholder="输入播放列表名称" 
          clearable 
        />
        
        <div class="action-buttons">
          <van-button plain round @click="showCreatePlaylist = false">取消</van-button>
          <van-button type="primary" round @click="createNewPlaylist">创建</van-button>
        </div>
      </div>
    </van-popup>
    
    <!-- 播放次数设置弹窗 -->
    <van-popup
      v-model:show="playerStore.showPlayCountSetting"
      position="bottom"
      round
      :style="{ padding: '20px' }"
    >
      <div class="play-count-setting">
        <div class="setting-title">设置单曲循环的次数</div>
        
        <div class="setting-option">
          <div class="option-label">不设置</div>
          <div class="custom-checkbox" @click="toggleInfiniteMode">
            <div :class="isInfinitePlayMode ? 'checkbox-inner checked' : 'checkbox-inner'"></div>
            <span>不设置循环次数</span>
          </div>
        </div>
        
        <div class="setting-option">
          <div class="option-label">设次数</div>
          <div class="count-adjuster">
            <van-button 
              icon="minus" 
              round 
              size="small" 
              @click="playerStore.decreasePlayCount()"
              :disabled="isInfinitePlayMode"
            />
            <div class="count-display">{{ isInfinitePlayMode ? '∞' : playerStore.playCount }}</div>
<-            <van-button 
              icon="plus" 
              round 
              size="small" 
              @click="playerStore.increasePlayCount()"
            />
          </div>
        </div>
        
        <van-button block round type="primary" @click="playerStore.showPlayCountSetting = false">完成</van-button>
      </div>
    </van-popup>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '@/store/modules/player';
import { showToast as Toast } from 'vant';

const playerStore = usePlayerStore();
const showPlaylist = ref(false);
const showPlaylistManagement = ref(false);
const showCreatePlaylist = ref(false);
const newPlaylistName = ref('');
const activePlaylistId = ref(playerStore.activePlaylistId);
const longPressTimer = ref(null);

// 加载流程
const loading = ref(false);

// 监听活跃播放列表ID变化
watch(() => playerStore.activePlaylistId, (newId) => {
  activePlaylistId.value = newId;
});

// 获取当前活跃播放列表
const currentPlaylist = computed(() => {
  return playerStore.playlists.find(list => list.id === playerStore.activePlaylistId) || { songs: [] };
});

// 无限播放模式计算属性
const isInfinitePlayMode = computed(() => {
  return playerStore.playCount < 0;
});

// 切换无限播放模式
const toggleInfiniteMode = () => {
  if (isInfinitePlayMode.value) {
    // 如果当前是无限模式(-1)，切换回有限次数模式(1)
    playerStore.setPlayCount(1);
  } else {
    // 否则切换到无限模式
    playerStore.setPlayCount(-1);
  }
};

// 生成播放列表选项
const playlistOptions = computed(() => {
  return playerStore.playlists.map(list => ({
    text: list.name,
    value: list.id
  }));
});

// 播放模式图标
const playModeIcon = computed(() => {
  switch (playerStore.playMode) {
    case 1:
      return 'exchange';
    case 2:
      return 'replay';
    case 3:
      return 'shuffle';
    default:
      return 'exchange';
  }
});

// 格式化时间
const formatTime = (time) => {
  if (!time) return '00:00';
  
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 长按开始
function startLongPress() {
  longPressTimer.value = setTimeout(() => {
    // 打开播放次数设置面板
    playerStore.togglePlayCountSetting();
  }, 800); // 长按0.8秒触发
}

// 长按结束
function endLongPress() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value);
    longPressTimer.value = null;
  }
}

// 播放列表变更处理
function onPlaylistChange(playlistId) {
  playerStore.switchPlaylist(playlistId);
  Toast(`已切换至播放列表: ${playerStore.playlists.find(p => p.id === playlistId)?.name}`);
}

// 通过索引播放歌曲
function playSongByIndex(index) {
  if (!currentPlaylist.value || !currentPlaylist.value.songs[index]) return;
  
  const song = currentPlaylist.value.songs[index];
  playerStore.playSong(song); // 使用更新后的playSong方法
}

// 从播放列表中移除歌曲
function removeSongFromList(index) {
  if (!currentPlaylist.value || !currentPlaylist.value.songs[index]) return;
  
  // 检查是否是当前正在播放的歌曲
  const isCurrentSong = index === playerStore.currentIndex && 
                       currentPlaylist.value.id === playerStore.activePlaylistId;
                       
  if (isCurrentSong) {
    // 移除正在播放的歌曲，先切换到下一首
    playerStore.nextSong();
  }
  
  // 从列表中移除
  currentPlaylist.value.songs.splice(index, 1);
  
  // 如果移除的歌曲索引小于当前播放索引且是同一个列表，调整当前索引
  if (index < playerStore.currentIndex && currentPlaylist.value.id === playerStore.activePlaylistId) {
    playerStore.currentIndex--;
  }
  
  // 如果删除后播放列表为空
  if (currentPlaylist.value.songs.length === 0 && currentPlaylist.value.id === playerStore.activePlaylistId) {
    playerStore.currentSong = null;
    playerStore.currentIndex = -1;
    playerStore.playing = false;
  }
  
  // 保存到本地存储
  playerStore.savePlaylists();
}

// 选择播放列表
function selectPlaylist(playlistId) {
  playerStore.switchPlaylist(playlistId);
  showPlaylistManagement.value = false;
  Toast(`已切换至播放列表: ${playerStore.playlists.find(p => p.id === playlistId)?.name}`);
}

// 删除播放列表
function removePlaylist(playlistId) {
  if (playlistId === 'default') {
    Toast('默认列表不能删除');
    return;
  }
  
  // 确认删除
  if (confirm(`确定要删除播放列表吗？`)) {
    playerStore.deletePlaylist(playlistId);
    Toast('已删除播放列表');
  }
}

// 创建新播放列表
function createNewPlaylist() {
  if (!newPlaylistName.value.trim()) {
    Toast('请输入播放列表名称');
    return;
  }
  
  const playlistId = playerStore.createPlaylist(newPlaylistName.value.trim());
  newPlaylistName.value = '';
  showCreatePlaylist.value = false;
  Toast('新播放列表创建成功');
}

// 进度条点击事件
function onProgressBarClick(e) {
  const progressBar = e.target.closest('.progress-bar');
  if (!progressBar) return;
  
  const rect = progressBar.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percentage = offsetX / rect.width;
  
  if (playerStore.duration) {
    const newTime = playerStore.duration * percentage;
    // 这里应该发送一个消息给MiniPlayer组件，让它调整audio元素的currentTime
    // 或者在后续实现完整播放器逻辑后再优化
    playerStore.updateCurrentTime(newTime);
  }
}
</script>

<style lang="scss" scoped>
// 自定义复选框样式
.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  .checkbox-inner {
    width: 20px;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 2px;
    margin-right: 8px;
    position: relative;
    
    &.checked {
      background-color: #1989fa;
      border-color: #1989fa;
      
      &:after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 11px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
  
  span {
    font-size: 14px;
  }
}

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
    }
    
    :deep(.van-dropdown-menu__item) {
      justify-content: flex-start;
      padding: 0 10px;
      font-weight: bold;
      color: #1989fa;
    }
      }
  .right-actions {
    display: flex;
    align-items: center;
    
    .van-icon {
      margin-left: 16px;
      font-size: 22px;
    }
  }
}
  }
}
.song-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  .cover {
    width: 250px;
    height: 250px;
    border-radius: 125px;
    overflow: hidden;
    margin-bottom: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      
      &.rotating {
        animation: rotate 20s linear infinite;
      }
    }
    
    .default-cover {
      width: 100%;
      height: 100%;
      background-color: #eee;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
  .info {
    width: 100%;
    text-align: center;
    
    .name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .artist {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }
    
    .play-status {
      display: flex;
      justify-content: center;
      font-size: 14px;
      color: #999;
      margin-top: 10px;
      
      .mode-text {
        margin-right: 20px;
      }
      
      .count-text {
        color: #1989fa;
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
