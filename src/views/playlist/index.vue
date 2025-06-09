<script setup>
import { getTopPlaylistHighquality, getHighqualityTags } from '../../apis/music';
import { formatPlayCount } from '@/utils/tools'
import { showToast } from 'vant';
const router = useRouter();

// 标签列表数据
const tags = ref([]);
const activeTag = ref('全部');

// 歌单列表数据
const playlists = ref([]);
// 是否正在加载
const loading = ref(false);
// 是否已加载全部
const finished = ref(false);
// 总数据数量
const total = ref(0);
// 分页参数
const params = ref({
  limit: 20,
  before: null,
  cat: '全部'
});

// 获取精品歌单标签列表
const fetchTags = async () => {
  try {
    const res = await getHighqualityTags();
    if (res && res.tags) {
      // 添加"全部"标签
      tags.value = [{name: '全部'}, ...res.tags];
    }
  } catch (error) {
    console.error('获取精品歌单标签失败:', error);
    showToast('获取精品歌单标签失败');
  }
};

// 注意标签变化
const watchActiveTag = () => {
  // 如果标签没有改变，不做处理
  if (params.value.cat === activeTag.value) return;
  
  console.log(`标签已切换到: ${activeTag.value}`);
  
  // 更新参数
  params.value = {
    limit: 20,
    before: null,
    cat: activeTag.value
  };
  
  // 重置数据和状态
  playlists.value = [];
  total.value = 0; // 重置总数量
  finished.value = false;
  loading.value = false; // 重置加载状态，这样van-list才会重新触发@load事件
  
  // 强制下一个循环再加载数据，确保切换后立即加载
  nextTick(() => {
    fetchPlaylists();
  });
};

// 监听标签变化
watch(() => activeTag.value, (newTag) => {
  console.log('监听到标签变化:', newTag);
  watchActiveTag();
});

// 点击标签事件处理
const onTagClick = (item) => {
  console.log('点击了标签:', item);
  // 点击事件可能不是必需的，因为我们已经通过watch进行了处理
};

// 获取精品歌单列表
const fetchPlaylists = async () => {
  if(!loading.value){
    loading.value = true;
  }

  try {
    const res = await getTopPlaylistHighquality(params.value);
    loading.value=false
    if(res){
    params.value.before = res.lasttime;
    if(!res.more||res.playlists.length<20  ){
        finished.value = true;
      }
      // 追加数据
      playlists.value = [...playlists.value, ...res.playlists];
     
    }else{
      finished.value = true;
    }
   
  } catch (error) {
    console.error('获取精品歌单失败:', error);
    showToast('获取精品歌单失败');
  } finally {
    loading.value = false;
  }
};

// 点击歌单
const goToPlaylistDetail = (playlist) => {
  router.push({
    path: `/playlist-detail`,
    query:{
      id:playlist.id
    }
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 组件挂载时
onMounted(() => {
  fetchTags();
  fetchPlaylists();
});
</script>

<template>
  <div class="playlists-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar 
      title="精品歌单" 
      left-arrow 
      @click-left="goBack"
      fixed
    >
      <template #right>
        <div class="total-info" v-if="total > 0">共{{total}}条</div>
      </template>
    </van-nav-bar>
    
    <div class="content">
      <!-- 标签滑动选择器 -->
      <div class="tags-container">
        <!-- 简化标签事件处理 -->
        <van-tabs 
          v-model:active="activeTag" 
          swipeable 
          animated  sticky shrink 
          @click-tab="onTagClick">
          <van-tab 
            v-for="tag in tags" 
            :key="tag.name" 
            :title="tag.name" 
            :name="tag.name">
          </van-tab>
        </van-tabs>
      </div>
      <!-- 歌单列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="fetchPlaylists"
      >
        <div class="playlists-grid">
          <div 
            v-for="(playlist,index) in playlists" 
            :key="playlist.id" 
            class="playlist-item"
            @click="goToPlaylistDetail(playlist)"
          >
            <div class="playlist-cover">
          <img :src="playlist.coverImgUrl" :alt="playlist.name">
              <div class="playlist-count">
                <van-icon name="play-circle-o" />
                {{ formatPlayCount(playlist.playCount) }}
              </div>
            </div>
            <div class="playlist-name">{{ playlist.name }}</div>
            <div class="playlist-creator">
              <van-icon name="manager-o" />
              {{ playlist.creator.nickname }}
              <p v-if="playlist.tags.length">
                <van-tag type="danger" size="mini" round mark
                v-for="tag in playlist.tags"
                >{{tag}}</van-tag>
              </p>
            </div>
          </div>
        </div>
      </van-list>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.playlists-container {
  min-height: 100vh;
  background-color: $bg-color;
}

.content {
  padding: 96px 12px 20px;
}

.tags-container {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: $bg-color;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.playlist-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .playlist-cover {
    position: relative;
    width: 100%;
    
    img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    
    .playlist-count {
      position: absolute;
      top: 6px;
      right: 6px;
      padding: 2px 6px;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      border-radius: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      
      .van-icon {
        margin-right: 4px;
      }
    }
  }
  
  .playlist-name {
    padding: 8px 8px 4px;
    font-size: 14px;
    font-weight: 500;
    color: $text-color;
    @include text-ellipsis;
  }
  
  .playlist-creator {
    padding: 0 8px 8px;
    font-size: 12px;
    color: $text-color-light;
    display: flex;
    align-items: center;
    
    .van-icon {
      margin-right: 4px;
      font-size: 12px;
    }
  }
}
</style>
