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
      <van-icon 
        name="bars"
        size="24" 
        @click.stop="showPlaylist = true" 
        @touchstart="startLongPress"
        @touchend="endLongPress"
        @touchcancel="endLongPress"
      />
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
      :style="{ height: '75%' }"
    >
      <!-- 标签栏 -->
      <div class="playlist-header">
        <div 
          class="header-item" 
          :class="{ active: activeTab === 'playing' }" 
          @click="activeTab = 'playing'"
        >
          正在播放
        </div>
        <div 
          class="header-item" 
          :class="{ active: activeTab === 'songHistory' }" 
          @click="activeTab = 'songHistory'"
        >
          歌曲历史
        </div>
      </div>

      <!-- 播放控制行 -->
      <div class="play-mode-row" v-if="activeTab === 'playing'">
        <div class="mode-control" @click="togglePlayMode">
          <van-icon v-if="playModeIcon.type===1" :name="playModeIcon.icon" class="mode-icon" />
          <i v-if="playModeIcon.type===2" :class="playModeIcon.icon" class="mode-icon"/>
          <span class="mode-text">{{ playModeText }}</span>
        </div>
        <div class="action-buttons">
          <van-icon name="arrow-down" class="action-btn" />
          <van-icon name="delete" class="action-btn" @click="playerStore.clearActivePlaylist()" />
          <van-icon name="plus" class="action-btn" />
        </div>
      </div>
      
      <!-- 播放列表内容 -->
      <div class="playlist-content">
        <!-- 正在播放标签页 -->
        <template v-if="activeTab === 'playing'">
          <div 
            v-for="(song, index) in currentPlaylist?.songs" 
            :key="song.id"
            class="song-item"
            :class="{ 'active': playerStore.currentIndex === index && activePlaylistId === playerStore.activePlaylistId }"
            @click="playSongByIndex(index)"
          >
            <div class="song-main">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <div class="song-controls">
              <van-icon name="cross" class="action-icon" @click.stop="removeSongFromList(index)" />
            </div>
          </div>
          <div v-if="!currentPlaylist?.songs.length" class="empty-list">暂无歌曲</div>
        </template>
        
        <!-- 歌曲历史标签页 -->
        <template v-else-if="activeTab === 'songHistory'">
          <div 
            v-for="(song, index) in playerStore.playHistory" 
            :key="song.id + index"
            class="song-item"
            @click="playerStore.playSong(song)"
          >
            <div class="song-main">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <div class="song-controls">
              <van-icon name="cross" class="action-icon" />
            </div>
          </div>
          <div v-if="!playerStore.playHistory.length" class="empty-list">暂无播放历史</div>
        </template>
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
            <van-button 
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
</template>

<script setup>
import '@/assets/css/icon-font/iconfont.css';
import { showToast } from 'vant';
import { usePlayerStore } from '@/store/modules/player';
const playerStore = usePlayerStore();
const audioRef = ref(null);
const showPlaylist = ref(false);
const activeTab = ref('playing'); // 当前活跃的标签页：'playing', 'songHistory', 'playlistHistory'
const activePlaylistId = ref(playerStore.activePlaylistId); // 当前选中的播放列表ID
 const longPressTimer=ref(null)
// 当前播放列表计算属性
const currentPlaylist = computed(() => {
  return playerStore.playlists.find(list => list.id === activePlaylistId.value);
});

// 播放列表选项
const playlistOptions = computed(() => {
  return playerStore.playlists.map(list => ({
    text: `${list.name} (${list.songs.length})`,
    value: list.id
  }));
});

// 无限播放模式计算属性
const isInfinitePlayMode = computed(() => {
  return playerStore.playCount < 0;
});

// 播放模式图标计算属性
const playModeIcon = computed(() => {
  switch (playerStore.playMode) {
    case 1: // 顺序播放
      return {
        icon:'replay',
        type:1
      }
    case 2: // 单曲循环
        return {
          icon : 'descending' ,
          type : 1
        }
    case 3: // 随机播放
        return {
          icon : 'iconfont icon-suijibofang' ,
          type : 2
        }

    default:
      return {
        icon:'replay',
        type:1
      }
  }
});

// 播放模式文本
const playModeText = computed(() => {
  switch (playerStore.playMode) {
    case 1: return '顺序播放';
    case 2: return '单曲循环';
    case 3: return '随机播放';
    default: return '顺序播放';
  }
});

// 切换播放模式
const togglePlayMode = () => {
  // 循环切换: 1(顺序) -> 2(单曲) -> 3(随机) -> 1(顺序)...
  playerStore.changePlayMode();
  showToast(playModeText.value);
};

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

// 可以播放事件
function onCanPlay() {
  if (!audioRef.value) return;
  playerStore.updateDuration(audioRef.value.duration);
}

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

// 下载当前歌曲
function downloadCurrentSong() {
  if (!playerStore.currentSong) {
    showToast('没有可下载的歌曲');
    return;
  }
  
  // 如果有歌曲URL，则创建一个链接进行下载
  if (playerStore.currentSong.url) {
    const a = document.createElement('a');
    a.href = playerStore.currentSong.url;
    a.download = `${playerStore.currentSong.name} - ${playerStore.currentSong.artist}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('开始下载');
  } else {
    showToast('歌曲链接不可用，无法下载');
  }
}

// 切换播放列表
// function switchPlaylist(playlistId) {
//   if (playerStore.activePlaylistId === playlistId) return;
//   playerStore.switchPlaylist(playlistId);
//   activePlaylistId.value = playlistId;
// }

// 在下拉选择器中切换播放列表
// function onPlaylistChange(playlistId) {
//   switchPlaylist(playlistId);
// }

// 监听activePlaylistId的变化
watch(() => playerStore.activePlaylistId, (newId) => {
  activePlaylistId.value = newId;
});

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

// 键盘事件监听
function handleKeyDown(e) {
  switch(e.code) {
    case 'Space': // 空格键控制播放/暂停
      e.preventDefault();
      playerStore.togglePlay();
      break;
    case 'ArrowLeft': // 左方向键切换到上一首
      playerStore.prevSong();
      break;
    case 'ArrowRight': // 右方向键切换到下一首
      playerStore.nextSong();
      break;
    case 'KeyM': // M键切换播放模式
      playerStore.changePlayMode();
      Toast(`已切换为: ${playerStore.playModeText}`);
      break;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style lang="scss" scoped>
// 引入变量和mixin
@import '@/style/variables.scss';

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
      background-color: $primary-color;
      border-color: $primary-color;
      
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

// 迷你播放器样式
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
  
  &-content {
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
    top: 0;
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

// 播放列表头部
.playlist-header {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.header-item {
  flex: 1;
  text-align: center;
  font-size: 15px;
  color: $text-color;
  padding: 12px 0;
  position: relative;
  
  &.active {
    color: #000;
    font-weight: 500;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #000;
      transform: scaleX(0.3);
      margin: 0 auto;
      width: 24px;
    }
  }
}

// 播放模式行与操作按钮
.play-mode-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.mode-control {
  display: flex;
  align-items: center;
}

.mode-icon {
  font-size: 18px;
  margin-right: 6px;
}

.mode-text {
  font-size: 14px;
  color: $text-color;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  font-size: 18px;
  margin-left: 15px;
  color: #666;
}

// 播放列表内容区域
.playlist-content {
  overflow-y: auto;
  padding-bottom: 50px;
  height: calc(100% - 96px);
}

// 歌曲项目样式
.song-item {
  position: relative;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  
  &.active {
    color: $primary-color;
    background-color: rgba(0, 0, 0, 0.02);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: $primary-color;
    }
    
    .song-name {
      font-weight: 500;
    }
    
    .song-artist {
      color: $primary-color;
      opacity: 0.8;
    }
  }
  
  .song-main {
    flex: 1;
    margin-right: 10px;
    overflow: hidden;
    
    .song-name {
      font-size: 15px;
      margin-bottom: 4px;
      @include text-ellipsis;
    }
    
    .song-artist {
      font-size: 13px;
      color: $text-color-light;
      @include text-ellipsis;
    }
  }
  
  .song-controls {
    display: flex;
    align-items: center;
    
    .action-icon {
      padding: 6px;
      font-size: 18px;
      color: $text-color-light;
    }
  }
}

// 空列表提示
.empty-list {
  padding: 30px 0;
  text-align: center;
  color: $text-color-light;
  font-size: 14px;
}

// 底部播放控制区
.playlist-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 15px;
  border-top: 1px solid $border-color;
  background-color: #fff;
  
  .play-control-info {
    margin-bottom: 12px;
  }
  
  .mode-display {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #666;
    
    .mode-text {
      font-weight: 500;
    }
    
    .play-count-text {
      color: $text-color-light;
    }
  }
  
  .play-mode-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #666;
    
    span {
      cursor: pointer;
      
      &:active {
        opacity: 0.8;
      }
    }
    
    .play-count {
      color: $primary-color;
    }
  }
}

// 播放次数设置弹窗
.play-count-setting {
  padding: 15px;
  
  .setting-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .setting-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
    
    .option-label {
      font-size: 14px;
    }
    
    .count-adjuster {
      display: flex;
      align-items: center;
      
      .count-display {
        width: 50px;
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        margin: 0 10px;
      }
    }
    
    .custom-check {
      width: 20px;
      height: 20px;
      border: 1px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.checked {
        border-color: $primary-color;
        background-color: $primary-color;
        
        &:after {
          content: '';
          width: 6px;
          height: 10px;
          border-right: 2px solid #fff;
          border-bottom: 2px solid #fff;
          transform: rotate(45deg) translate(-1px, -1px);
        }
      }
    }
  }
}

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
