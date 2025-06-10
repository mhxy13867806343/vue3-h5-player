import { defineStore } from 'pinia';
import router from '@/router';

// 默认迷你播放器样式配置
const defaultMiniPlayerStyle = {
  backgroundColor: '#3c3f41', // 默认背景色
  textColor: '#ffffff',      // 文本颜色
  fontSize: 14,              // 字体大小
  artistColor: '#a5a5a5',    // 歌手名称颜色
  artistFontSize: 12,        // 歌手字体大小
  progressColor: '#1989fa',  // 进度条颜色
  iconColor: '#ffffff'       // 图标颜色
};

// 默认隐藏播放器的路径
const defaultHiddenPaths = [
  '/setting'
];

// 获取路由中定义的所有路径
const getAllRoutePaths = () => {
  const paths = [];
  const getPathsFromRoutes = (routes) => {
    routes.forEach(route => {
      if (route.path && route.path !== '/:pathMatch(.*)*' && route.path !== '/') {
        paths.push(route.path);
      }
      if (route.children) {
        getPathsFromRoutes(route.children);
      }
    });
  };
  
  getPathsFromRoutes(router.options.routes);
  return paths;
};

// 设置状态管理
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 迷你播放器样式设置
    miniPlayerStyle: {
      ...defaultMiniPlayerStyle
    },
    // 播放器显示控制
    playerVisibility: {
      // 默认在所有页面都显示，这里存放不显示的路径
      hiddenPaths: [...defaultHiddenPaths]
    }
  }),
  
  getters: {
    // 获取所有有效的路由路径
    allRoutePaths() {
      return getAllRoutePaths();
    },
    // 检查路径是否在路由系统中有效
    isValidPath() {
      const paths = getAllRoutePaths();
      return (path) => paths.includes(path);
    }
  },
    
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
        ...defaultMiniPlayerStyle
      };
    },
    
    // 添加不显示播放器的页面路径
    addHiddenPath(path) {
      // 添加路径前检查路径是否有效且不重复
      const validPaths = getAllRoutePaths();
      const isValid = validPaths.includes(path);
      const isDuplicate = this.playerVisibility.hiddenPaths.includes(path);
      
      if (isValid && !isDuplicate) {
        this.playerVisibility.hiddenPaths.push(path);
        return { success: true, message: '添加成功' };
      } else if (isDuplicate) {
        return { success: false, message: '该路径已存在' };
      } else {
        return { success: false, message: '无效的路径' };
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
