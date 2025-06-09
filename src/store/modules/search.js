import { defineStore } from 'pinia';

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchHistory: [], // 搜索历史记录
  }),
  
  actions: {
    // 添加搜索历史
    addSearchHistory(keyword) {
      if (!keyword || keyword.trim() === '') return;
      
      // 如果已存在该关键词，先移除旧记录
      const index = this.searchHistory.indexOf(keyword);
      if (index > -1) {
        this.searchHistory.splice(index, 1);
      }
      
      // 添加到历史记录开头
      this.searchHistory.unshift(keyword);
      
      // 最多保留20条历史记录
      if (this.searchHistory.length > 20) {
        this.searchHistory.pop();
      }
      
      // 保存到本地存储
      this.saveToLocalStorage();
    },
    
    // 删除单条搜索历史
    removeSearchHistory(keyword) {
      const index = this.searchHistory.indexOf(keyword);
      if (index > -1) {
        this.searchHistory.splice(index, 1);
        this.saveToLocalStorage();
      }
    },
    
    // 清空搜索历史
    clearSearchHistory() {
      this.searchHistory = [];
      this.saveToLocalStorage();
    },
    
    // 保存到本地存储
    saveToLocalStorage() {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    },
    
    // 从本地存储加载
    loadFromLocalStorage() {
      const history = localStorage.getItem('search_history');
      if (history) {
        try {
          this.searchHistory = JSON.parse(history);
        } catch (e) {
          this.searchHistory = [];
        }
      }
    }
  },
  
  getters: {
    // 获取历史记录
    getSearchHistory: (state) => state.searchHistory
  }
});
