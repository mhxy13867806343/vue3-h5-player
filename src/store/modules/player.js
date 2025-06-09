import { defineStore } from 'pinia';

// 从本地存储获取播放历史
const getLocalPlayHistory = () => {
  const history = localStorage.getItem('playHistory');
  return history ? JSON.parse(history) : [];
};

// 保存播放历史到本地存储
const savePlayHistory = (history) => {
  // 最多保存50条历史记录
  const limitedHistory = history.slice(0, 50);
  localStorage.setItem('playHistory', JSON.stringify(limitedHistory));
};

// 播放器状态管理
export const usePlayerStore = defineStore('player', {
  state: () => ({
    // 当前播放歌曲信息
    currentSong: null,
    // 播放状态
    playing: false,
    // 播放列表
    playlist: [],
    // 当前播放索引
    currentIndex: -1,
    // 播放模式：1-列表循环，2-单曲循环，3-随机播放
    playMode: 1,
    // 播放时间
    currentTime: 0,
    // 歌曲总时长
    duration: 0,
    // 是否显示播放器页面
    showPlayerPage: false,
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
  },

  actions: {
    // 播放歌曲
    playSong(song) {
      // 如果当前歌单中已有这首歌
      const index = this.playlist.findIndex(item => item.id === song.id);
      if (index > -1) {
        this.currentIndex = index;
      } else {
        // 否则添加到播放列表
        this.playlist.push(song);
        this.currentIndex = this.playlist.length - 1;
      }
      
      this.currentSong = song;
      this.playing = true;
      
      // 添加到播放历史
      this.addToPlayHistory(song);
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
    
    // 上一首
    prevSong() {
      if (this.playlist.length === 0) return;
      
      let index = this.currentIndex - 1;
      if (index < 0) {
        index = this.playlist.length - 1;
      }
      
      this.currentIndex = index;
      this.currentSong = this.playlist[index];
      this.playing = true;
    },
    
    // 下一首
    nextSong() {
      if (this.playlist.length === 0) return;
      
      let index = this.currentIndex + 1;
      if (index >= this.playlist.length) {
        index = 0;
      }
      
      this.currentIndex = index;
      this.currentSong = this.playlist[index];
      this.playing = true;
    },
    
    // 更新播放时间
    updateCurrentTime(time) {
      this.currentTime = time;
    },
    
    // 更新总时长
    updateDuration(duration) {
      this.duration = duration;
    },
    
    // 切换播放模式
    changePlayMode() {
      this.playMode = this.playMode % 3 + 1;
    },
    
    // 打开/关闭播放器页面
    togglePlayerPage() {
      this.showPlayerPage = !this.showPlayerPage;
    },
    
    // 清空播放列表
    clearPlaylist() {
      this.playlist = [];
      this.currentIndex = -1;
      this.currentSong = null;
      this.playing = false;
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
