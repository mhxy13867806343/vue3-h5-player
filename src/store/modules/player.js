import { defineStore } from 'pinia';
import { showDialog,showConfirmDialog } from 'vant';
// 本地存储键名
const STORAGE_KEYS = {
  PLAY_HISTORY: 'playHistory',
  PLAYLISTS: 'musicPlaylists',
  PLAY_MODE: 'playMode',
  PLAY_COUNT: 'playCount',
  LAST_PLAYLIST_ID: 'lastPlaylistId'
};

// 从本地存储获取播放历史
const getLocalPlayHistory = () => {
  const history = localStorage.getItem(STORAGE_KEYS.PLAY_HISTORY);
  return history ? JSON.parse(history) : [];
};

// 保存播放历史到本地存储
const savePlayHistory = (history) => {
  // 最多保存50条历史记录
  const limitedHistory = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.PLAY_HISTORY, JSON.stringify(limitedHistory));
};

// 从本地存储获取播放列表集合
const getLocalPlaylists = () => {
  const playlists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
  if (playlists) {
    return JSON.parse(playlists);
  }
  // 默认创建一个"默认列表"
  const defaultPlaylist = {
    id: 'default',
    name: '默认列表',
    songs: []
  };
  return [defaultPlaylist];
};

// 保存播放列表到本地存储
const savePlaylists = (playlists) => {
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
};

// 获取本地存储的播放模式
const getLocalPlayMode = () => {
  const mode = localStorage.getItem(STORAGE_KEYS.PLAY_MODE);
  return mode ? parseInt(mode) : 1; // 默认为列表循环
};

// 保存播放模式到本地存储
const savePlayMode = (mode) => {
  localStorage.setItem(STORAGE_KEYS.PLAY_MODE, mode.toString());
};

// 获取本地存储的播放次数
const getLocalPlayCount = () => {
  const count = localStorage.getItem(STORAGE_KEYS.PLAY_COUNT);
  return count !== null ? parseInt(count) : -1; // 默认为-1（无限循环）
};

// 保存播放次数到本地存储
const savePlayCount = (count) => {
  localStorage.setItem(STORAGE_KEYS.PLAY_COUNT, count.toString());
};

// 获取上次使用的播放列表ID
const getLastPlaylistId = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_PLAYLIST_ID) || 'default';
};

// 保存上次使用的播放列表ID
const saveLastPlaylistId = (id) => {
  localStorage.setItem(STORAGE_KEYS.LAST_PLAYLIST_ID, id);
};

// 播放器状态管理
export const usePlayerStore = defineStore('player', {
  state: () => ({
    // 当前播放歌曲信息
    currentSong: null,
    // 播放状态
    playing: false,
    // 多播放列表管理
    playlists: getLocalPlaylists(),
    // 当前活跃的播放列表ID
    activePlaylistId: getLastPlaylistId(),
    // 当前播放索引
    currentIndex: -1,
    // 播放模式：1-列表循环，2-单曲循环，3-随机播放
    playMode: getLocalPlayMode(),
    // 播放次数设置：-1表示无限循环
    playCount: getLocalPlayCount(),
    // 当前歌曲已播放次数
    currentSongPlayCount: 0,
    // 播放时间
    currentTime: 0,
    // 歌曲总时长
    duration: 0,
    // 是否显示播放器页面
    showPlayerPage: false,
    // 是否显示播放次数设置弹窗
    showPlayCountSetting: false,
    // MV相关状态
    isMvPlaying: false,     // 是否正在播放MV
    currentMv: null,        // 当前播放的MV信息
    mvUrl: '',              // MV播放地址
    mvResolution: 1080,     // MV分辨率
    // 播放历史
    playHistory: getLocalPlayHistory(),
  }),

  getters: {
    // 是否有歌曲正在播放或暂停
    hasSong: (state) => !!state.currentSong && !state.isMvPlaying,
    
    // 是否有MV正在播放或暂停
    hasMv: (state) => !!state.currentMv,
    
    // 播放进度百分比
    progress: (state) => {
      return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    },
    
    // 是否有内容在播放（歌曲或MV）
    hasContent: (state) => !!state.currentSong || !!state.currentMv,
    
    // 获取当前激活的播放列表
    activePlaylist: (state) => {
      return state.playlists.find(list => list.id === state.activePlaylistId) || state.playlists[0] || null;
    },
    
    // 获取当前播放列表的歌曲
    playlist: (state) => {
      const activeList = state.playlists.find(list => list.id === state.activePlaylistId);
      return activeList ? activeList.songs : [];
    },
    
    // 获取播放模式显示文本
    playModeText: (state) => {
      switch(state.playMode) {
        case 1: return '列表循环';
        case 2: return '单曲循环';
        case 3: return '随机播放';
        default: return '列表循环';
      }
    },
    
    // 获取播放次数显示文本
    playCountText: (state) => {
      return state.playCount === -1 ? '无限循环' : `播放${state.playCount}次`;
    },
    
    // 是否显示播放次数设置
    showPlayCountText: (state) => state.playCount !== -1,
    
    // 是否显示多列表切换 (仅当有超过1个列表时显示)
    hasMultiplePlaylists: (state) => state.playlists.length > 1,
  },

  actions: {
    // 播放歌曲
    playSong(song) {
      if (!song || !song.id) return;
      
      // 获取当前活跃的播放列表
      const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
      if (!activePlaylist) return;
      
      // 检查歌曲是否已在播放列表中
      const index = activePlaylist.songs.findIndex(item => item.id === song.id);
      
      if (index > -1) {
        // 如果已存在，直接播放该歌曲
        this.currentIndex = index;
      } else {
        // 如果不存在，添加到播放列表
        activePlaylist.songs.push(song);
        this.currentIndex = activePlaylist.songs.length - 1;
        
        // 保存到本地存储
        savePlaylists(this.playlists);
      }
      
      this.currentSong = song;
      this.playing = true;
      this.currentSongPlayCount = 0; // 重置播放次数计数
      
      // 添加到播放历史
      this.addToPlayHistory(song);
    },
    
    // 播放全部歌曲
    playAll(songs, replace = true) {
      if (!songs || !songs.length) return;
      
      // 获取当前活跃的播放列表
      const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
      if (!activePlaylist) return;
      
      // 替换模式：清空当前列表，添加新歌曲
      if (replace) {
        activePlaylist.songs = [];
      }
      
      // 过滤已经存在的歌曲
      const newSongs = songs.filter(newSong => 
        !activePlaylist.songs.some(existingSong => existingSong.id === newSong.id)
      );
      
      // 添加新歌曲
      if (newSongs.length > 0) {
        activePlaylist.songs.push(...newSongs);
        
        // 如果当前没有正在播放的歌曲，播放第一首
        if (!this.currentSong) {
          this.currentIndex = 0;
          this.currentSong = activePlaylist.songs[0];
          this.playing = true;
          this.currentSongPlayCount = 0; // 重置播放次数计数
        }
        
        // 保存到本地存储
        savePlaylists(this.playlists);
        
        // 添加第一首歌到播放历史
        this.addToPlayHistory(activePlaylist.songs[0]);
      }
    },
    
    // 添加歌曲到播放列表（不立即播放）
    addToPlaylist(song) {
      if (!song || !song.id) return;
      
      // 获取当前活跃的播放列表
      const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
      if (!activePlaylist) return;
      
      // 检查是否已存在
      const exists = activePlaylist.songs.some(item => item.id === song.id);
      
      // 如果不存在，添加到列表
      if (!exists) {
        activePlaylist.songs.push(song);
        
        // 保存到本地存储
        savePlaylists(this.playlists);
      }
    },
    
    // 添加到播放历史
    addToPlayHistory(song) {
      if (!song || !song.id) return;
      
      // 如果已经在历史中，先移除
      const existIndex = this.playHistory.findIndex(item => item.id === song.id);
      if (existIndex > -1) {
        this.playHistory.splice(existIndex, 1);
      }
      
      // 添加到历史的最前面
      const historyItem = {
        ...song,
        type: 'music', // 显式设置类型为音乐
        playedAt: new Date().getTime() // 添加播放时间
      };
      
      this.playHistory.unshift(historyItem);
      
      // 保存到本地存储
      savePlayHistory(this.playHistory);
    },
    
    // 播放/暂停切换
    togglePlay() {
      if (!this.currentSong) return;
      this.playing = !this.playing;
    },
    
    // 切换播放列表
    switchPlaylist(playlistId) {
      // 检查是否存在该播放列表
      const playlist = this.playlists.find(list => list.id === playlistId);
      if (!playlist) return;
      
      this.activePlaylistId = playlistId;
      this.currentIndex = -1;
      this.currentSong = null;
      this.playing = false;
      
      // 保存最后使用的列表ID
      saveLastPlaylistId(playlistId);
      
      // 如果列表有歌曲，自动播放第一首
      if (playlist.songs.length > 0) {
        this.currentIndex = 0;
        this.currentSong = playlist.songs[0];
        this.playing = true;
        this.currentSongPlayCount = 0; // 重置播放次数
      }
    },
    
    // 创建新的播放列表
    createPlaylist(name, songs = []) {
      const id = `playlist_${Date.now()}`;
      const newPlaylist = {
        id,
        name: name || `播放列表 ${this.playlists.length + 1}`,
        songs: [...songs]
      };
      
      this.playlists.push(newPlaylist);
      savePlaylists(this.playlists);
      
      return id; // 返回新创建的列表ID
    },
    
    // 删除播放列表
    deletePlaylist(playlistId) {
      // 防止删除默认列表
      if (playlistId === 'default') return;
      
      const index = this.playlists.findIndex(list => list.id === playlistId);
      if (index === -1) return;
      
      this.playlists.splice(index, 1);
      
      // 如果删除的是当前活跃列表，切换回默认列表
      if (playlistId === this.activePlaylistId) {
        this.activePlaylistId = 'default';
        this.currentIndex = -1;
        this.currentSong = null;
        this.playing = false;
      }
      
      // 保存到本地存储
      savePlaylists(this.playlists);
      saveLastPlaylistId(this.activePlaylistId);
    },
    
    // 上一首
    prevSong() {
      const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
      if (!activePlaylist || activePlaylist.songs.length === 0) return;
      
      let index = this.currentIndex - 1;
      if (index < 0) {
        // 如果是多播放列表模式且有多个列表
        if (this.playlists.length > 1 && this.playMode === 1) {
          // 找到当前列表的上一个列表
          const currentListIndex = this.playlists.findIndex(list => list.id === this.activePlaylistId);
          let prevListIndex = currentListIndex - 1;
          if (prevListIndex < 0) prevListIndex = this.playlists.length - 1;
          
          // 切换到上一个列表的最后一首歌
          const prevList = this.playlists[prevListIndex];
          if (prevList.songs.length > 0) {
            this.activePlaylistId = prevList.id;
            this.currentIndex = prevList.songs.length - 1;
            this.currentSong = prevList.songs[prevList.songs.length - 1];
            this.playing = true;
            this.currentSongPlayCount = 0; // 重置播放次数
            saveLastPlaylistId(this.activePlaylistId);
            return;
          }
        }
        
        // 如果不是多列表模式或没有上一个列表的歌曲，则循环到当前列表的最后一首
        index = activePlaylist.songs.length - 1;
      }
      
      this.currentIndex = index;
      this.currentSong = activePlaylist.songs[index];
      this.playing = true;
      this.currentSongPlayCount = 0; // 重置播放次数
    },
    
    // 下一首
    nextSong() {
      const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
      if (!activePlaylist || activePlaylist.songs.length === 0) return;
      
      // 如果设置了播放次数限制
      if (this.playCount > 0 && this.currentSongPlayCount >= this.playCount) {
        // 已达到播放次数限制，自动切换到下一首
        this.currentSongPlayCount = 0;
      } else if (this.playCount > 0) {
        // 还可以继续播放当前歌曲
        return;
      }
      
      // 根据播放模式决定下一首歌曲
      switch (this.playMode) {
        case 1: // 列表循环
          let index = this.currentIndex + 1;
          if (index >= activePlaylist.songs.length) {
            // 如果是多播放列表模式且有多个列表
            if (this.playlists.length > 1) {
              // 找到当前列表的下一个列表
              const currentListIndex = this.playlists.findIndex(list => list.id === this.activePlaylistId);
              let nextListIndex = currentListIndex + 1;
              if (nextListIndex >= this.playlists.length) nextListIndex = 0;
              
              // 切换到下一个列表的第一首歌
              const nextList = this.playlists[nextListIndex];
              if (nextList.songs.length > 0) {
                this.activePlaylistId = nextList.id;
                this.currentIndex = 0;
                this.currentSong = nextList.songs[0];
                this.playing = true;
                this.currentSongPlayCount = 0; // 重置播放次数
                saveLastPlaylistId(this.activePlaylistId);
                return;
              }
            }
            
            // 如果不是多列表模式或没有下一个列表的歌曲，则循环到当前列表的第一首
            index = 0;
          }
          this.currentIndex = index;
          this.currentSong = activePlaylist.songs[index];
          break;
          
        case 2: // 单曲循环
          // 不切换歌曲，重置播放计数器
          this.currentSongPlayCount = 0;
          break;
          
        case 3: // 随机播放
          // 随机选择一首歌曲播放
          const randomIndex = Math.floor(Math.random() * activePlaylist.songs.length);
          this.currentIndex = randomIndex;
          this.currentSong = activePlaylist.songs[randomIndex];
          break;
      }
      
      this.playing = true;
    },
    
    // 更新播放时间
    updateCurrentTime(time) {
      this.currentTime = time;
      
      // 如果已经播放完一遗遍，则增加播放次数计数器
      if (time === 0 && this.duration > 0 && this.currentSongPlayCount >= 0) {
        this.currentSongPlayCount++;
        
        // 检查是否达到播放次数限制
        if (this.playCount > 0 && this.currentSongPlayCount >= this.playCount) {
          // 自动断开当前歌曲，播放下一首
          this.nextSong();
        }
      }
    },
    
    // 更新总时长
    updateDuration(duration) {
      this.duration = duration;
    },
    
    // 切换播放模式
    changePlayMode() {
      this.playMode = this.playMode % 3 + 1;
      savePlayMode(this.playMode);
    },
    
    // 打开/关闭播放器页面
    togglePlayerPage() {
      this.showPlayerPage = !this.showPlayerPage;
    },
    
    // 打开/关闭播放次数设置弹窗
    togglePlayCountSetting() {
      this.showPlayCountSetting = !this.showPlayCountSetting;
    },
    
    // 清空当前活跃的播放列表
    clearActivePlaylist() {
      showConfirmDialog({
        title: '提示',
        message:
          '真的要清空当前活跃的播放列表吗？',
      })
        .then(() => {
          const activePlaylist = this.playlists.find(list => list.id === this.activePlaylistId);
          if (activePlaylist) {
            activePlaylist.songs = [];
            this.currentIndex = -1;
            this.currentSong = null;
            this.playing = false;
            
            // 保存到本地存储
            savePlaylists(this.playlists);
          }
        })
        .catch(() => {
          // on cancel
        });
     
    },
    
    // 清空指定播放列表
    clearPlaylist(playlistId) {
      const targetPlaylist = this.playlists.find(list => list.id === (playlistId || this.activePlaylistId));
      if (targetPlaylist) {
        targetPlaylist.songs = [];
        
        // 如果清空的是当前活跃列表，重置播放状态
        if (targetPlaylist.id === this.activePlaylistId) {
          this.currentIndex = -1;
          this.currentSong = null;
          this.playing = false;
        }
        
        // 保存到本地存储
        savePlaylists(this.playlists);
      }
    },
    
    // 设置播放次数
    setPlayCount(count) {
      // 校验数字
      const numCount = parseInt(count);
      if (isNaN(numCount)) return;
      
      // 设置播放次数
      this.playCount = numCount;
      this.currentSongPlayCount = 0; // 重置当前播放次数
      
      // 保存到本地存储
      savePlayCount(numCount);
    },
    
    // 增加播放次数
    increasePlayCount() {
      if (this.playCount === -1) {
        this.playCount = 1;
      } else {
        this.playCount++;
      }
      savePlayCount(this.playCount);
    },
    
    // 减少播放次数
    decreasePlayCount() {
      if (this.playCount <= 1) {
        this.playCount = -1; // -1 代表无限循环
      } else {
        this.playCount--;
      }
      savePlayCount(this.playCount);
    },
    
    
    // 清空歌曲播放历史
    clearSongHistory() {
      // 保留MV类型的历史记录，移除歌曲类型的记录
      this.playHistory = this.playHistory.filter(item => item.type === 'mv');
      savePlayHistory(this.playHistory);
    },
    
    // 清空MV播放历史
    clearMvHistory() {
      // 保留歌曲类型的历史记录，移除MV类型的记录
      this.playHistory = this.playHistory.filter(item => !item.type || item.type !== 'mv');
      savePlayHistory(this.playHistory);
    },
    
    // MV相关方法
    // 播放MV
    playMv(mv, url, resolution = 1080) {
      // 如果正在播放音乐，先暂停音乐
      if (this.playing && this.currentSong) {
        this.playing = false;
      }
      
      this.currentMv = mv;
      this.mvUrl = url;
      this.mvResolution = resolution;
      this.isMvPlaying = true;
      this.playing = true;
      this.showPlayerPage = true;
      
      // 添加到MV播放历史
      this.addToMvHistory(mv, url, resolution);
    },
    
    // 添加到MV播放历史
    addToMvHistory(mv, url, resolution) {
      if (!mv || !mv.id) return;
      
      // 如果已经在历史中，先移除
      const existIndex = this.playHistory.findIndex(item => item.id === mv.id && item.type === 'mv');
      if (existIndex > -1) {
        this.playHistory.splice(existIndex, 1);
      }
      
      // 添加到历史的最前面
      const historyItem = {
        ...mv,
        type: 'mv',
        url: url,
        resolution: resolution,
        playedAt: new Date().getTime() // 添加播放时间
      };
      
      this.playHistory.unshift(historyItem);
      
      // 保存到本地存储
      savePlayHistory(this.playHistory);
    },
    
    // 切换MV分辨率
    changeMvResolution(resolution, url) {
      this.mvResolution = resolution;
      this.mvUrl = url;
    },
    
    // 停止播放MV
    stopMv() {
      this.currentMv = null;
      this.mvUrl = '';
      this.isMvPlaying = false;
      this.playing = false;
    },
  }
});
