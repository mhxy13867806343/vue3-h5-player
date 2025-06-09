<script setup>
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant';
import { getSearchDefault, getSearchHot, searchSuggest } from '@/apis/music';
import { useSearchStore } from '@/store/modules/search';
import { debounce } from '@/utils/tools';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();

// 搜索关键词
const keyword = ref('');
// 热门搜索
const hotKeywords = ref([]);
// 是否加载中
const loading = ref(false);
// 搜索提示结果
const searchSuggestions = ref([]);
// 是否显示提示结果
const showSuggestions = ref(false);

// 初始化数据
onMounted(() => {
  // 获取路由传来的关键词
  if (route.query.keyword) {
    keyword.value = route.query.keyword;
  }
  
  // 获取默认搜索关键词和热搜列表
  Promise.all([
    fetchDefaultKeyword(),
    fetchHotSearch()
  ]);
  
  // 加载搜索历史
  searchStore.loadFromLocalStorage();
});

// 获取搜索默认关键词
const fetchDefaultKeyword = async () => {
  try {
    const res = await getSearchDefault();
    if (res.data) {
      // 设置默认搜索关键词
      if (!keyword.value && res.data.showKeyword) {
        keyword.value = res.data.showKeyword;
      }
    }
  } catch (error) {
    showToast('获取默认搜索关键词失败');
  }
};

// 获取热搜列表
const fetchHotSearch = async () => {
  loading.value = true;
  try {
    const res = await getSearchHot();
    if (res && res.result && res.result.hots) {
      // 设置热搜列表
      hotKeywords.value = res.result.hots.map(item => item.first);
    }
  } catch (error) {
    showToast('获取热搜列表失败');
  } finally {
    loading.value = false;
  }
};

// 保存搜索历史，使用Pinia Store
const saveSearchHistory = (key) => {
  if (!key.trim()) return;
  searchStore.addSearchHistory(key);
};

// 提交搜索
const handleSearch = () => {
  if (!keyword.value.trim()) {
    showToast('请输入搜索关键词');
    return;
  }
  
  // 保存搜索历史
  saveSearchHistory(keyword.value);
  
  // 关闭提示
  showSuggestions.value = false;
  
  // 这里可以实现搜索逻辑，暂时仅打印
  showToast('搜索: ' + keyword.value);
};

// 点击热门搜索或历史
const clickKeyword = (key) => {
  keyword.value = key;
  handleSearch();
};

// 获取搜索多重匹配结果
const fetchSearchSuggestions = async (key) => {
  if (!key || key.trim() === '') {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  
  try {
    const res = await searchSuggest({ keywords: key });
    if (res && res.result) {
      // 处理返回的多重匹配结果
      const suggestions = [];
      
      // 添加艺术家
      if (res.result.songs && res.result.songs.length > 0) {
        res.result.songs.forEach(songs => {
          suggestions.push({
            type: 'artist',
            name: songs.name,
            id: songs.id,
            picUrl: songs.picUrl
          });
        });
      }
      
      // 添加专辑
      if (res.result.album && res.result.album.length > 0) {
        res.result.album.forEach(album => {
          suggestions.push({
            type: 'album',
            name: album.name,
            id: album.id,
            picUrl: album.picUrl
          });
        });
      }
      
      // 添加歌单
      if (res.result.playlist && res.result.playlist.length > 0) {
        res.result.playlist.forEach(playlist => {
          suggestions.push({
            type: 'playlist',
            name: playlist.name,
            id: playlist.id,
            picUrl: playlist.coverImgUrl
          });
        });
      }
      
      searchSuggestions.value = suggestions;
      showSuggestions.value = suggestions.length > 0;
    } else {
      searchSuggestions.value = [];
      showSuggestions.value = false;
    }
  } catch (error) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
  }
};

// 节流处理搜索建议
// 使用防抖而非节流，因为搜索建议需要等待用户输入完成后再发送请求
const debouncedFetchSuggestions = debounce(fetchSearchSuggestions, 500);

// 监听关键词变化
watch(() => keyword.value, (newValue) => {
  debouncedFetchSuggestions(newValue);
});

// 清空历史(带确认弹窗)
const clearHistory = () => {
  showDialog({
    title: '清除搜索历史',
    message: '确定要清除所有搜索历史吗？',
    theme: 'round-button',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  .then(() => {
    // 点击了确认按钮
    searchStore.clearSearchHistory();
    showToast('历史记录已清除');
  })
  .catch(() => {
    // 点击了取消按钮
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="search-container">
    <!-- 搜索栏 -->
    <van-search
      v-model="keyword"
      placeholder="请输入搜索关键词"
      shape="round"
      show-action
      @search="handleSearch"
      @focus="showSuggestions = keyword.trim() !== '' && searchSuggestions.length > 0"
    >
      <template #left>
        <van-icon name="arrow-left" size="20" @click="goBack" />
      </template>
      <template #action>
        <div class="search-btn" @click="handleSearch">搜索</div>
      </template>
    </van-search>
    
    <!-- 搜索建议 -->
    <div class="search-suggestions" v-if="showSuggestions && searchSuggestions.length > 0">
      <div 
        v-for="(item, index) in searchSuggestions" 
        :key="index"
        class="suggestion-item"
        @click="clickKeyword(item.name)"
      >
        <img v-if="item.picUrl" :src="item.picUrl + '?param=40y40'" class="suggestion-pic" />
        <div v-else class="suggestion-icon">
          <van-icon :name="item.type === 'artist' ? 'contact' : (item.type === 'album' ? 'music-o' : 'star-o')" />
        </div>
        <div class="suggestion-info">
          <div class="suggestion-name">{{ item.name }}</div>
          <div class="suggestion-type">
            {{ item.type === 'artist' ? '歌手' : (item.type === 'album' ? '专辑' : '歌单') }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索内容区 -->
    <div class="search-content">
      <!-- 热门搜索 -->
      <div class="section" v-if="hotKeywords.length > 0">
        <div class="section-title">热搜列表</div>
        <div class="keyword-list">
          <div 
            v-for="(item, index) in hotKeywords" 
            :key="index" 
            class="keyword-tag"
            @click="clickKeyword(item)"
          >
            <span class="hot-rank" v-if="index < 3">
              {{ index + 1 }}
            </span>
            <span class="hot-rank normal" v-else>
              {{ index + 1 }}
            </span>
            {{ item }}
          </div>
        </div>
      </div>
      
      <!-- 搜索历史 -->
      <div class="section" v-if="searchStore.searchHistory.length > 0">
        <div class="section-header">
          <div class="section-title">搜索历史</div>
          <van-icon name="delete" class="delete-icon" size="16" @click="clearHistory" />
        </div>
        <div class="history-list">
          <div
            v-for="(item, index) in searchStore.searchHistory"
            :key="index"
            class="history-item"
            @click="clickKeyword(item)"
          >
            <van-icon name="clock-o" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
  position: relative;
  
  :deep(.van-search) {
    background-color: $primary-color;
    
    .van-search__content {
      background-color: rgba(255, 255, 255, 0.8);
    }
    
    .van-icon {
      color: #fff;
    }
  }
  
  .search-btn {
    color: #fff;
    font-size: 14px;
    padding: 0 12px;
  }
  
  .search-suggestions {
    position: absolute;
    top: 54px;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 100;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-height: 60vh;
    overflow-y: auto;
    
    .suggestion-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid $border-color;
      
      &:last-child {
        border-bottom: none;
      }
      
      .suggestion-pic {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 12px;
      }
      
      .suggestion-icon {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 12px;
        background-color: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .van-icon {
          font-size: 20px;
          color: $text-color-light;
        }
      }
      
      .suggestion-info {
        flex: 1;
        
        .suggestion-name {
          font-size: 14px;
          color: $text-color;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .suggestion-type {
          font-size: 12px;
          color: $text-color-light;
        }
      }
    }
  }
}

.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  .section {
    margin-bottom: 20px;
    
    .section-title {
      font-size: 16px;
      color: $text-color;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .delete-icon {
        padding: 8px;
        color: $text-color-light;
      }
    }
  }
  
  .keyword-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .keyword-tag {
      padding: 6px 12px;
      background-color: #fff;
      border-radius: 20px;
      font-size: 14px;
      color: $text-color;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      
      .hot-rank {
        display: inline-block;
        width: 18px;
        height: 18px;
        text-align: center;
        line-height: 18px;
        border-radius: 50%;
        background-color: #ff3a3a;
        color: #fff;
        font-size: 12px;
        margin-right: 6px;
        font-weight: bold;
        
        &.normal {
          background-color: #999;
        }
      }
    }
  }
  
  .history-list {
    .history-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid $border-color;
      color: $text-color-light;
      
      .van-icon {
        margin-right: 6px;
        font-size: 14px;
      }
    }
  }
}
</style>
