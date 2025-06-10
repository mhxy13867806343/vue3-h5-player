<template>
  <div class="mini-player"
       :style="{
         ...minpayStyle,
         backgroundColor: settingsStore.miniPlayerStyle.backgroundColor,
         display: shouldShowPlayer ? undefined : 'none'
       }"
       v-show="playerStore.hasSong">
    <div class="mini-player-content" @click="playerStore.togglePlayerPage">
      <div class="song-cover">
        <img v-if="playerStore.currentSong?.picUrl" :src="playerStore.currentSong.picUrl + '?param=60y60'" />
        <div v-else class="default-cover">
          <van-icon name="music-o" size="24" />
        </div>
      </div>
      <div class="song-info">
        <div class="song-name" :style="{
          color: settingsStore.miniPlayerStyle.textColor,
          fontSize: settingsStore.miniPlayerStyle.fontSize + 'px'
        }">{{ playerStore.currentSong?.name || '未知歌曲' }}</div>
        <div class="song-artist" :style="{
          color: settingsStore.miniPlayerStyle.artistColor,
          fontSize: settingsStore.miniPlayerStyle.artistFontSize + 'px'
        }">{{ playerStore.currentSong?.artist || '未知歌手' }}</div>
      </div>
    </div>
    
    <div class="player-controls">
      <van-icon 
        :name="playerStore.playing ? 'pause-circle-o' : 'play-circle-o'" 
        size="30" 
        :style="{ color: settingsStore.miniPlayerStyle.iconColor }"
        @click.stop="playerStore.togglePlay" 
      />
      <van-icon 
        name="bars"
        size="24" 
        :style="{ color: settingsStore.miniPlayerStyle.iconColor }"
        @click.stop="showPlaylist = true" 
        @touchstart="startLongPress"
        @touchend="endLongPress"
        @touchcancel="endLongPress"
      />
    </div>
    
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress" :style="{ 
        width: `${playerStore.progress}%`,
        backgroundColor: settingsStore.miniPlayerStyle.progressColor 
      }"></div>
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
            :class="{ 'active': isCurrentSong(index) }"
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
          <!-- 歌曲历史控制行 -->
          <div class="play-mode-row"  v-if="playerStore.playHistory.length">
            <div class="mode-control" @click="playerStore.toggleHistoryMultiSelectMode()">
              <van-icon :name="playerStore.historyMultiSelectMode ? 'checked' : 'newspaper-o'" class="mode-icon" />
              <span class="mode-text">{{ playerStore.historyMultiSelectMode ? '多选模式' : '浏览模式' }}</span>
            </div>
            <div class="action-buttons">
              <template v-if="playerStore.historyMultiSelectMode && playerStore.historySelectedItems.length">
                <van-icon name="play-circle-o" class="action-btn" @click="playerStore.addMultipleSongsToPlaylist()" />
                <van-icon name="delete" class="action-btn" @click="playerStore.removeMultipleFromHistory()" />
                <van-icon :name="isAllHistorySelected ? 'checked' : 'circle'" class="action-btn" @click="playerStore.toggleSelectAllHistory()" />
              </template>
              <template v-else>
                <van-icon name="search" class="action-btn" @click="playerStore.toggleHistorySearch()" v-if="playerStore.playHistory.length" />
                <van-icon name="delete" class="action-btn" @click="playerStore.clearPlayHistory()" v-if="playerStore.playHistory.length" />
              </template>
            </div>
          </div>
          
          <!-- 搜索框 -->
          <div class="search-bar" v-if="playerStore.showHistorySearch && playerStore.playHistory.length">
            <van-search
              v-model="playerStore.historySearchKey"
              placeholder="搜索歌曲历史..."
              shape="round"
              background="transparent"
              @search="searchHistory"
              @clear="clearHistorySearch"
              @input="searchHistory"
              clearable
              show-action
            >
              <template #action>
                <div @click="playerStore.toggleHistorySearch()">取消</div>
              </template>
            </van-search>
          </div>
          
          <!-- 歌曲历史列表 -->
          <div 
            v-for="(song, index) in filteredHistory" 
            :key="song.id + index"
            class="song-item"
            :class="{'selected': isHistorySongSelected(song)}"
            @click="handleHistorySongClick(song)"
          >
            <div class="song-main">
              <div class="song-name">{{ song.name }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <div class="song-controls">
              <van-icon 
                :name="playerStore.historyMultiSelectMode ? (isHistorySongSelected(song) ? 'checked' : 'circle') : 'plus'" 
                class="action-icon" 
                @click.stop="playerStore.historyMultiSelectMode ? playerStore.toggleHistorySongSelection(song) : playerStore.addSongToPlaylist(song)" 
              />
              <van-icon v-if="!playerStore.historyMultiSelectMode" name="cross" class="action-icon" @click.stop="playerStore.removeFromHistory(song)" />
            </div>
          </div>
          
          <!-- 空状态提示 -->
          <div v-if="!filteredHistory.length && !playerStore.playHistory.length" class="empty-list">暂无播放历史</div>
          <div v-else-if="!filteredHistory.length && playerStore.playHistory.length" class="empty-list">没有匹配的搜索结果</div>
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
import { useSettingsStore } from '@/store/modules/settings';
import { usePlayerSync } from '@/hooks/usePlayerSync';

const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const audioRef = ref(null);
const showPlaylist = ref(false);
const activeTab = ref('playing'); // 当前活跃的标签页：'playing', 'songHistory', 'playlistHistory'
const activePlaylistId = ref(playerStore.activePlaylistId); // 当前选中的播放列表ID
const longPressTimer = ref(null);
  const route=useRoute()
const minpayStyle=ref({})

// 计算属性，判断是否应该显示播放器
const shouldShowPlayer = computed(() => {
  return settingsStore.shouldShowPlayer(route.path);
});

// 歌曲历史搜索相关
const filteredHistory = ref([]);
// 使用播放器同步hook
const { 
  currentPlaylist, 
  isActivePlaylist, 
  playSongByIndex, 
  isCurrentSong 
} = usePlayerSync(activePlaylistId);

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
const isRouterPath=()=>{
  const path=['/home','/user']

  if(!path.includes(route.path)){
    minpayStyle.value={
       bottom:'0px',
    }
  }else{
    minpayStyle.value={
       bottom:'50px',
    }
  }
  minpayStyle.value['transition']=`bottom  0.2s`;
  return minpayStyle.value
}
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
watch(()=>route,(news,olds)=>{
  // 更新播放器位置
  isRouterPath()
  // 当路由变化时，shouldShowPlayer计算属性会自动重新计算
},{
  deep:true
})
// 初始化
onMounted(() => {
  if (playerStore.playing) {
    playAudio();
  }

  // 初始化过滤历史记录
  searchHistory();

});
onUnmounted(()=>{

})

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

// 使用usePlayerSync hook提供的playSongByIndex方法

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

// 监听播放历史变化或搜索条件变化，更新过滤后的歌曲历史
watch([() => playerStore.playHistory, () => playerStore.historySearchKey, () => playerStore.showHistorySearch], () => {
  searchHistory();
});

// 监听弹出层和activeTab，确保关闭或切换时重置搜索
watch([() => showPlaylist.value, () => activeTab.value], () => {
  // 如果关闭弹窗或切换标签，重置搜索状态
  if (!showPlaylist.value || activeTab.value !== 'songHistory') {
    playerStore.showHistorySearch = false;
    playerStore.historySearchKey = '';
  }
  // 每次打开时刷新过滤歌曲列表
  searchHistory();
});

// 从播放列表中移除歌曲
// 歌曲历史搜索功能
function searchHistory() {
  // 如果不显示搜索或没有查询词，则显示全部历史
  if (!playerStore.showHistorySearch || !playerStore.historySearchKey.trim()) {
    filteredHistory.value = [...playerStore.playHistory];
    return;
  }
  
  // 执行搜索过滤
  const query = playerStore.historySearchKey.toLowerCase().trim();
  filteredHistory.value = playerStore.playHistory.filter(song => 
    song.name.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query)
  );
}

// 清除历史搜索
function clearHistorySearch() {
  playerStore.historySearchKey = '';
  searchHistory();
}

// 判断歌曲是否被选中
function isHistorySongSelected(song) {
  if (!playerStore.historyMultiSelectMode) return false;
  return playerStore.historySelectedItems.some(item => item.id === song.id);
}

// 处理歌曲点击事件
function handleHistorySongClick(song) {
  if (playerStore.historyMultiSelectMode) {
    // 多选模式下切换选择状态
    playerStore.toggleHistorySongSelection(song);
  } else {
    // 添加到播放列表但不播放
    playerStore.addSongToPlaylist(song);
  }
}

// 判断是否全部选中
const isAllHistorySelected = computed(() => {
  if (!playerStore.historyMultiSelectMode || filteredHistory.value.length === 0) return false;
  return filteredHistory.value.every(song => 
    playerStore.historySelectedItems.some(item => item.id === song.id)
  );
});

// 判断是否可以关闭弹窗
const canClosePopup = computed(() => {
  // 只有当当前活跃的播放列表和历史记录都为空时，才允许关闭
  const activeList = currentPlaylist.value;
  const hasActiveSongs = activeList && activeList.songs && activeList.songs.length > 0;
  const hasHistory = playerStore.playHistory && playerStore.playHistory.length > 0;
  
  // 在播放列表标签页时，如果有历史但没有当前列表，则仍然有内容可以查看
  if (activeTab.value === 'playing' && !hasActiveSongs && hasHistory) {
    return false;
  }
  
  // 在历史标签页时，如果有当前列表但没有历史，则仍然有内容可以查看
  if (activeTab.value === 'songHistory' && hasActiveSongs && !hasHistory) {
    return false;
  }
  
  // 如果两者都为空，则允许关闭
  return !hasActiveSongs && !hasHistory;
});

// 点击蒙层处理
function handleOverlayClick() {
  if (!canClosePopup.value) {
    // 如果不能关闭，则通知用户切换到有内容的标签页
    if (activeTab.value === 'playing' && !currentPlaylist.value?.songs?.length && playerStore.playHistory.length > 0) {
      // 如果在播放列表页面，但当前列表为空而历史不为空
      activeTab.value = 'songHistory';
      showToast('点击左上角返回按钮可以关闭');
    } else if (activeTab.value === 'songHistory' && playerStore.playHistory.length === 0 && currentPlaylist.value?.songs?.length > 0) {
      // 如果在历史页面，但历史为空而当前列表不为空
      activeTab.value = 'playing';
      showToast('点击左上角返回按钮可以关闭');
    } else {
      canClosePopup.value=false
    }
  }
}

function removeSongFromList(index) {
  if (!currentPlaylist.value || !currentPlaylist.value.songs[index]) return;
  
  const songToRemove = currentPlaylist.value.songs[index];
  
  // 如果正在播放的歌曲被移除
  if (playerStore.currentSongIndex === index) {
    if (currentPlaylist.value.songs.length === 1) {
      // 如果是最后一首歌，暂停播放
      playerStore.resetCurrentSong();
    } else {
      // 播放下一首
      const nextIndex = index === currentPlaylist.value.songs.length - 1 ? 0 : index;
      playerStore.setCurrentSongIndex(nextIndex);
    }
  } else if (playerStore.currentSongIndex > index) {
    // 如果移除的歌曲在当前播放歌曲之前，则需要调整当前播放索引
    playerStore.setCurrentSongIndex(playerStore.currentSongIndex - 1);
  }
  
  // 直接修改当前播放列表，移除歌曲
  const playlist = playerStore.playlists.find(list => list.id === playerStore.activePlaylistId);
  if (playlist) {
    playlist.songs.splice(index, 1);
    showToast(`已从列表中移除: ${songToRemove.name}`);
    // 保存到本地存储
    playerStore.savePlaylists();
  }
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
  
  &.selected {
    background-color: rgba($primary-color, 0.1);
    border-left: 2px solid $primary-color;
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
@keyframes _show  {
  0%{
    opacity: 0;
    transform: translateY(50px);

  }
  25%{
    opacity: 0.25;
     transform: translateY(25px);
  }
  50%{
    opacity: 0.5;
     transform: translateY(10px);
  }
  75%{
    opacity: 0.75;
     transform: translateY(5px);
  }
  100%{
      opacity:1;
     transform: translateY(0);
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
  animation: _show .5s linear;

  
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
