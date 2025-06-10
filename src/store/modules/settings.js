import { defineStore } from 'pinia';

// 设置状态管理
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 迷你播放器样式设置
    miniPlayerStyle: {
      backgroundColor: '#ffffff', // 背景色
      textColor: '#333333', // 文字颜色
      artistColor: '#666666', // 艺术家文字颜色
      fontSize: 14, // 歌曲名称字体大小
      artistFontSize: 12, // 艺术家字体大小
      progressColor: '#2979ff', // 进度条颜色
      iconColor: '#333333' // 图标颜色
    },
    // 播放器显示控制
    playerVisibility: {
      // 默认在所有页面都显示，这里存放不显示的路径
      hiddenPaths: ['/setting']
    }
  }),
  
  actions: {
    // 更新迷你播放器样式
    updateMiniPlayerStyle(style) {
      this.miniPlayerStyle = {
        ...this.miniPlayerStyle,
        ...style
      };
    },
    
    // 重置迷你播放器样式为默认值
    resetMiniPlayerStyle() {
      this.miniPlayerStyle = {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        artistColor: '#666666',
        fontSize: 14,
        artistFontSize: 12,
        progressColor: '#2979ff',
        iconColor: '#333333'
      };
    },
    
    // 添加不显示播放器的页面路径
    addHiddenPath(path) {
      if (!this.playerVisibility.hiddenPaths.includes(path)) {
        this.playerVisibility.hiddenPaths.push(path);
      }
    },
    
    // 移除不显示播放器的页面路径
    removeHiddenPath(path) {
      this.playerVisibility.hiddenPaths = this.playerVisibility.hiddenPaths.filter(
        item => item !== path
      );
    },
    
    // 检查是否应该在当前路径显示播放器
    shouldShowPlayer(path) {
      return !this.playerVisibility.hiddenPaths.includes(path);
    }
  },
  
  // 持久化设置
  persist: {
    key: 'player-settings',
    storage: localStorage,
    paths: ['miniPlayerStyle', 'playerVisibility']
  }
});
