<script setup>
import { ref, reactive, onMounted, onActivated, watch, watchEffect } from 'vue';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { useRouter, useRoute } from 'vue-router';
import { 
  getSearchDefault, 
  getBanners, 
  getTopPlaylistHighquality, 
  getTopArtists, 
  getPersonalized, 
  getTopMv,
  getPersonalizedNewSong
} from '@/apis/music';
import { formatPlayCount, formatTime } from '@/utils/tools';

const router = useRouter();
const route = useRoute();

// 是否需要重新加载数据
const needRefresh = ref(false);

// 默认搜索关键词
const defaultKeyword = ref('');

// 轮播图数据
const banners = ref([]);

// 精品歌单数据
const playlists = ref([]);

// 热门歌手数据
const topArtists = ref([]);

// 推荐歌单数据
const recommendPlaylists = ref([]);

// 推荐新音乐
const newSongs = ref([]);

// MV排行榜
const topMvs = ref([]);

// 加载状态
const loading = reactive({
  banners: false,
  playlists: false,
  keyword: false,
  topArtists: false,
  recommendPlaylists: false,
  newSongs: false,
  topMvs: false
});

// 获取默认搜索关键词
const fetchDefaultKeyword = async () => {
  loading.keyword = true;
  try {
    const res = await getSearchDefault();
    // 直接使用API返回的数据，不需要再读data属性
    console.log(res,22)
    defaultKeyword.value = res.data
    ?.showKeyword || res.data
    ?.realkeyword || '搜索音乐';
  } catch (error) {
    defaultKeyword.value = '搜索音乐';
  } finally {
    loading.keyword = false;
  }
};

// 获取轮播图
const fetchBanners = async () => {
  loading.banners = true;
  try {
    const res = await getBanners({ type: 3 });
    // 直接使用API返回的数据，数组可能在res.banners或者res本身
    banners.value = Array.isArray(res) ? res : (res?.banners || []);
  } catch (error) {
    showToast('获取轮播图失败');
  } finally {
    loading.banners = false;
  }
};

// 获取精品歌单
const fetchTopPlaylists = async () => {
  loading.playlists = true;
  try {
    const res = await getTopPlaylistHighquality({ limit: 6 });
    // 直接使用API返回的数据，对象可能在res.playlists或者res本身包含playlists
    playlists.value = res?.playlists || (Array.isArray(res) ? res : []);
  } catch (error) {

    showToast('获取精品歌单失败');
  } finally {
    loading.playlists = false;
  }
};

// 获取热门歌手
const fetchTopArtists = async () => {
  loading.topArtists = true;
  try {
    const res = await getTopArtists({ limit: 9, offset: 0 });
    if (res.code === 200) {
      topArtists.value = res.artists || [];
    } else {
      topArtists.value = [];
    }
  } catch (error) {
    console.error('获取热门歌手失败:', error);
    topArtists.value = [];
  } finally {
    loading.topArtists = false;
  }
};

// 获取推荐歌单
const fetchRecommendPlaylists = async () => {
  loading.recommendPlaylists = true;
  try {
    const res = await getPersonalized({ limit: 6 });
    if (res.code === 200) {
      recommendPlaylists.value = res.result || [];
    } else {
      recommendPlaylists.value = [];
    }
  } catch (error) {
    console.error('获取推荐歌单失败:', error);
    recommendPlaylists.value = [];
  } finally {
    loading.recommendPlaylists = false;
  }
};

// 获取推荐新音乐
const fetchNewSongs = async () => {
  loading.newSongs = true;
  try {
    const res = await getPersonalizedNewSong({ limit: 6 });
    if (res.code === 200) {
      newSongs.value = res.result || [];
    } else {
      newSongs.value = [];
    }
  } catch (error) {
    console.error('获取推荐新音乐失败:', error);
    newSongs.value = [];
  } finally {
    loading.newSongs = false;
  }
};

// 获取MV排行榜
const fetchTopMvs = async () => {
  loading.topMvs = true;
  try {
    const res = await getTopMv({ limit: 6 });
    if (res.code === 200) {
      topMvs.value = res.data || [];
    } else {
      topMvs.value = [];
    }
  } catch (error) {
    console.error('获取MV排行失败:', error);
    topMvs.value = [];
  } finally {
    loading.topMvs = false;
  }
};



// 跳转到搜索页
const goToSearch = () => {
  router.push({
    path: '/search',
    query: { keyword: defaultKeyword.value }
  });
};

// 跳转到歌单详情
const goToPlaylistDetail = (playlist) => {
  router.push({
    path: '/playlist-detail',
    query: { id: playlist.id }
  });
};

// 跳转到歌手详情页
const goToArtistDetail = (artist) => {
  router.push({
    path: '/artist',
    query: {
      id: artist.id
    }
  });
};

// 查看更多歌单
const seeMorePlaylists = () => {
  router.push({
    path: '/playlists'
  });
};

// 查看更多推荐歌单
const seeMoreRecommendPlaylists = () => {
  router.push({
    path: '/recommended-playlists'
  });
};

// 查看更多热门歌手
const seeMoreTopArtists = () => {
  router.push({
    path: '/artists',
    query: { type: '-1', area: '-1' }  // 默认参数，表示全部热门歌手
  });
};

// 查看更多MV排行
const seeMoreTopMvs = () => {
  router.push({
    path: '/top-mv'
  });
};

// 查看更多新音乐
const seeMoreNewSongs = () => {
  router.push({
    path: '/new-songs'
  });
};



// 跳转到MV详情页
const goToMvDetail = (mv) => {
  router.push({
    path: '/mv-detail',
    query: { id: mv.id }
  });
};

// 加载所有数据
const loadAllData = async (showLoading = true) => {
  // 是否显示全局加载提示
  if (showLoading) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      loadingType: 'spinner',
    });
  }
  
  try {
    // 并行请求，加快加载速度
    await Promise.all([
      fetchDefaultKeyword(),
      fetchBanners(),
      fetchTopPlaylists(),
      fetchTopArtists(),
      fetchRecommendPlaylists(),
      fetchNewSongs(),
      fetchTopMvs()
    ]);
    
    if (showLoading) {
      closeToast(); // 关闭加载提示
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    if (showLoading) {
      closeToast();
      showToast('加载数据失败，请刷新重试');
    }
  }finally {
    closeToast();
  }
};

// 初始化标记变量
const isFirstLoad = ref(true);
const hasLoadedData = ref(false);

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 如果是首页路径，则检查是否需要加载数据
    if (newPath === '/home' && !isFirstLoad.value) {
      console.log('路由切换到首页，重新加载数据');
      loadAllData(false); // 不显示加载提示
    }
  }
);

// 监听路由的query参数变化
watch(
  () => route.query,
  (query) => {
    if (query.refresh && hasLoadedData.value) {
      console.log('检测到refresh参数，重新加载数据');
      loadAllData(false);
      // 清除参数防止重复加载
      router.replace({ path: '/home', query: {} });
    }
  },
  { deep: true }
);

// 组件挂载时
onMounted(() => {
  console.log('首页组件挂载');
  loadAllData();
  isFirstLoad.value = false;
  hasLoadedData.value = true;
});

// 组件每次激活时
onActivated(() => {
  console.log('首页组件激活');
  
  // 检查localStorage中是否有刷新标记
  const shouldRefresh = localStorage.getItem('refreshHome') === 'true';
  if (shouldRefresh) {
    console.log('检测到localStorage刷新标记，重新加载数据');
    // 清除标记
    localStorage.removeItem('refreshHome');
    // 加载数据
    loadAllData(true); // 显示加载提示
    return;
  }
  
  // 其他刷新条件检查
  if (!hasLoadedData.value || route.query.refresh || needRefresh.value) {
    console.log('激活时重新加载数据');
    // 重新加载数据，但不显示加载提示
    loadAllData(false);
    // 重置刷新标志
    needRefresh.value = false;
    hasLoadedData.value = true;
    
    // 清除URL中refresh参数以防止重复请求
    if (route.query.refresh) {
      router.replace({ path: '/home', query: {} });
    }
  }
});
</script>

<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div class="home-container">
        <!-- 顶部搜索栏 -->
        <div class="search-container">
          <van-search
            v-model="defaultKeyword"
            placeholder="搜索音乐"
            readonly
            shape="round"
            @click="goToSearch"
          />
        </div>
        
        <!-- 轮播图 -->
        <div class="banner-container">
          <van-swipe class="banner-swipe" :autoplay="3000" indicator-color="white" lazy-render>
            <van-swipe-item v-for="banner in banners" :key="banner.pic">
              <div class="banner-type pos-relative">
                <span :style="{color:banner.titleColor}" class="fs-titleColor fs-12 fw-bold pos-absolute">
                  {{banner.typeTitle}}
                </span>
                <img :src="banner.pic" class="banner-image" />
              </div>
            </van-swipe-item>
            <template #indicator="{ active, total }">
              <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
            </template>
          </van-swipe>
        </div>
        
        <!-- 精品歌单 -->
        <div class="section-container">
          <div class="section-header">
            <div class="left">
              <div class="title">精品歌单</div>
            </div>
            <div class="right" @click="seeMorePlaylists">更多 ></div>
          </div>
          
          <van-grid :column-num="3" :border="false" :gutter="0">
            <van-grid-item v-for="playlist in playlists" :key="playlist.id" :text="playlist.name" @click="goToPlaylistDetail(playlist)" icon-prefix="">
              <div class="playlist-item">
                <div class="playlist-cover">
                  <img :src="playlist.coverImgUrl"  class="playlist-cover-img" />
                  <div class="play-count fs-14">
                    <van-icon name="play-circle-o" />
                    {{ formatPlayCount(playlist.playCount) }}
                  </div>
                </div>
                <div class="playlist-name fs-14 ">{{ playlist.name }}</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
        
        <!-- 热门歌手 -->
        <div class="section-container">
          <div class="section-header">
            <div class="left">
              <div class="title">热门歌手</div>
            </div>
            <div class="right" @click="seeMoreTopArtists">更多 ></div>
          </div>
          
          <van-grid :column-num="3" :border="false" :gutter="0">
            <van-grid-item
            @click="goToArtistDetail(artist)"
            v-for="artist in topArtists.slice(0, 6)" :key="artist.id" icon-prefix="">
              <div class="artist-item">
                <div class="artist-avatar">
                  <img :src="artist.picUrl" class="playlist-cover-img" />
                </div>
                <div class="artist-name fs-14">{{ artist.name }}</div>
                <div class="artist-info fs-12">{{ artist.musicSize }}首歌曲</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
        
        <!-- 推荐歌单 -->
        <div class="section-container">
          <div class="section-header">
            <div class="left">
              <div class="title">推荐歌单</div>
            </div>
            <div class="right" @click="seeMoreRecommendPlaylists">更多 ></div>
          </div>
          
          <van-grid :column-num="3" :border="false" :gutter="0">
            <van-grid-item v-for="playlist in recommendPlaylists" :key="playlist.id" :text="playlist.name" @click="goToPlaylistDetail(playlist)" icon-prefix="">
              <div class="playlist-item">
                <div class="playlist-cover">
                  <img :src="playlist.picUrl" class="playlist-cover-img" />
                  <div class="play-count fs-14">
                    <van-icon name="play-circle-o" />
                    {{ formatPlayCount(playlist.playCount) }}
                  </div>
                </div>
                <div class="playlist-name fs-14 ">{{ playlist.name }}</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
        
        <!-- 推荐新音乐 -->
        <div class="section-container">
          <div class="section-header">
            <div class="left">
              <div class="title">新音乐</div>
            </div>
            <div class="right" @click="seeMoreNewSongs">更多 ></div>
          </div>
          
          <div class="new-songs-list">
            <div class="new-song-item" v-for="song in newSongs" :key="song.id">
              <div class="song-cover">
                <img :src="song.picUrl" alt="歌曲封面" />
                <van-icon name="play-circle" class="play-icon" />
              </div>
              <div class="song-info">
                <div class="song-name">{{ song.name }}</div>
                <div class="song-artist">{{ song.song?.artists?.[0]?.name || '未知歌手' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- MV排行 -->
        <div class="section-container">
          <div class="section-header">
            <div class="left">
              <div class="title">MV排行</div>
            </div>
            <div class="right" @click="seeMoreTopMvs">更多 ></div>
          </div>
          
          <div class="mv-list">
            <div class="mv-item" v-for="(mv, index) in topMvs" :key="mv.id" @click="goToMvDetail(mv)">
              <div class="mv-rank">{{ index + 1 }}</div>
              <div class="mv-cover">
                <img :src="mv.cover" alt="MV封面" />
                <div class="mv-play-count">
                  <van-icon name="video-o" />
                  <span>{{ formatPlayCount(mv.playCount) }}</span>
                </div>
                <van-icon name="play-circle" class="play-icon" />
              </div>
              <div class="mv-info">
                <div class="mv-name">{{ mv.name }}</div>
                <div class="mv-artist">{{ mv.artistName }}</div>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </div>
    
    <!-- 底部导航栏，固定在页面底部 -->
    <van-tabbar route>
      <van-tabbar-item replace to="/home" icon="music-o">发现音乐</van-tabbar-item>
      <van-tabbar-item replace to="/user" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-color;
  padding-bottom: 50px;
  overflow-y: auto;
}

.search-container {
  position: sticky;
  top: 0;
  z-index: 99;
  background-color: $primary-color;
  padding: 8px 0;
  
  :deep(.van-search) {
    background-color: transparent;
    padding: 0 12px;
    
    .van-search__content {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}

.banner-container {
  padding: 0 12px;
  margin-bottom: 16px;
  
  .banner-swipe {
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    
    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .custom-indicator {
      position: absolute;
      right: 10px;
      bottom: 10px;
      padding: 2px 6px;
      color: #fff;
      font-size: 12px;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
    }
  }
}

.playlist-section {
  padding: 0 12px 16px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 12px;
    
    .title {
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background-color: $primary-color;
        border-radius: 2px;
      }
    }
    
    .see-more {
      font-size: 14px;
      color: $text-color-light;
    }
  }
  
  .playlist-item {
    width: 100%;
    
    .playlist-cover {
      position: relative;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 6px;
      
      img {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
      }
      
      .playlist-count {
        position: absolute;
        top: 4px;
        right: 4px;
        padding: 2px 6px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        border-radius: 12px;
        font-size: 12px;
        display: flex;
        align-items: center;
        
        .van-icon {
          margin-right: 4px;
          font-size: 14px;
        }
      }
    }
    
   
  }
}
.playlist-name {
      font-size: 14px;
      color: $text-color;
      @include multi-ellipsis(1);
      line-height: 1.2;
      padding: 0 4px;
    }
.fs-titleColor{
  right:0;
  bottom:20%;
}
.song-item {
  width: 100%;
  
  .song-cover {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 6px;
    
    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    
    .play-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      padding: 2px 6px;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      
      .van-icon {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
  
  .song-name {
    font-size: 14px;
    color: $text-color;
    @include text-ellipsis;
    line-height: 1.2;
    padding: 0 4px;
  }
  
  .song-artist {
    font-size: 12px;
    color: $text-color-light;
    @include text-ellipsis;
    line-height: 1.2;
    padding: 0 4px;
    margin-top: 2px;
  }
}

.section-container {
  margin-bottom: 20px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 0 16px;
    
    .title {
      font-size: 18px;
      font-weight: 600;
      color: $text-color;
      position: relative;
      padding-left: 12px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background-color: $primary-color;
        border-radius: 2px;
      }
    }
    
    .right {
      color: #999;
      font-size: 14px;
    }
  }
}

// 新音乐样式
.new-songs-list {
  padding: 0 12px;
  
  .new-song-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .song-cover {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .play-icon {
        position: absolute;
        right: 5px;
        bottom: 5px;
        color: #fff;
        font-size: 24px;
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
      }
    }
    
    .song-info {
      flex: 1;
      overflow: hidden;
      
      .song-name {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .song-artist {
        font-size: 13px;
        color: #999;
      }
    }
  }
}

// MV排行样式
.mv-list {
  padding: 0 12px;
  
  .mv-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .mv-rank {
      font-size: 18px;
      font-weight: bold;
      color: $primary-color;
      width: 30px;
      text-align: center;
    }
    
    .mv-cover {
      position: relative;
      width: 120px;
      height: 68px;
      border-radius: 6px;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .mv-play-count {
        position: absolute;
        top: 5px;
        right: 5px;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-size: 12px;
        padding: 1px 5px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        
        .van-icon {
          margin-right: 2px;
          font-size: 12px;
        }
      }
      
      .play-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 30px;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
        opacity: 0.8;
      }
    }
    
    .mv-info {
      flex: 1;
      overflow: hidden;
      
      .mv-name {
        font-size: 15px;
        font-weight: 500;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .mv-artist {
        font-size: 13px;
        color: #999;
      }
    }
  }
}


</style>
