<template>
  <div class="artists-container">
    <van-nav-bar
      title="热门歌手"
      left-arrow
      fixed placeholder	
      z-index="999"
      @click-left="onClickLeft"
    >
      <template #right>
        <div class="total-info" v-if="total > 0">共{{total}}条</div>
      </template>
    </van-nav-bar>
    
   <div id="tabs"  ref="tabsRef">
 <!-- 歌手分类标签 -->
 <van-tabs 
      v-model:active="activeType" 
      swipeable 
      animated 
      sticky 
      :offset-top="44"
      shrink>
      <van-tab 
        v-for="type in typeOptions" 
        :key="type.value" 
        :title="type.name" 
        :name="type.value">
      </van-tab>
    </van-tabs>
    
    <!-- 地区筛选 -->
    <van-tabs 
      v-model:active="activeArea" 
      swipeable  :offset-top="44" sticky
      animated>
      <van-tab 
        v-for="area in areaOptions" 
        :key="area.value" 
        :title="area.name" 
        :name="area.value">
      </van-tab>
    </van-tabs>
    
    <!-- 字母筛选 -->
    <van-tabs 
      v-model:active="activeLetter" 
      swipeable 
      animated>
      <!-- 移除scrollspy属性，防止滚动时自动切换标签 -->
      <van-tab 
        v-for="letter in letterOptions" 
        :key="letter.value" 
        :title="letter.name" 
        :name="letter.value">
      </van-tab>
    </van-tabs>

   </div>
    
    <!-- 艺术家列表 -->
    <div class="artists-grid">
      <div 
        v-for="artist in artists" 
        :key="artist.id" 
        class="artist-item"
        @click="goToArtistDetail(artist)"
      >
        <div class="artist-cover">
          <img :src="artist.picUrl" :alt="artist.name">
        </div>
        <div class="artist-info">
          <div class="artist-name">{{ artist.name }}</div>
          <div class="artist-count">
            <span v-if="artist.musicSize">{{ artist.musicSize }}首单曲</span>
            <span v-if="artist.albumSize">{{ artist.albumSize }}张专辑</span>
            <span v-if="artist.mvSize">{{ artist.mvSize }}个MV</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 加载状态显示和加载更多按钮 -->
    <div class="loading-container">
      <van-loading v-if="loading" type="spinner" color="#1989fa" />
      <div v-else-if="finished" class="finished-text">没有更多歌手了</div>
      <van-button 
        v-else 
        type="primary" 
        size="small" 
        block 
        :disabled="loading" 
        @click="fetchArtists"
      >
        加载更多
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onUpdated,useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getArtistList, getTopArtists } from '@/apis/music';

const router = useRouter();

// 歌手类型选项
const typeOptions = [
  { name: '全部', value: '-1' },
  { name: '男歌手', value: '1' },
  { name: '女歌手', value: '2' },
  { name: '乐队组合', value: '3' }
];

// 地区选项
const areaOptions = [
  { name: '全部', value: '-1' },
  { name: '华语', value: '7' },
  { name: '欧美', value: '96' },
  { name: '日本', value: '8' },
  { name: '韩国', value: '16' },
  { name: '其他', value: '0' }
];

// 字母选项
const letterOptions = [
  { name: '热门', value: '-1' },
  { name: 'A', value: 'a' },
  { name: 'B', value: 'b' },
  { name: 'C', value: 'c' },
  { name: 'D', value: 'd' },
  { name: 'E', value: 'e' },
  { name: 'F', value: 'f' },
  { name: 'G', value: 'g' },
  { name: 'H', value: 'h' },
  { name: 'I', value: 'i' },
  { name: 'J', value: 'j' },
  { name: 'K', value: 'k' },
  { name: 'L', value: 'l' },
  { name: 'M', value: 'm' },
  { name: 'N', value: 'n' },
  { name: 'O', value: 'o' },
  { name: 'P', value: 'p' },
  { name: 'Q', value: 'q' },
  { name: 'R', value: 'r' },
  { name: 'S', value: 's' },
  { name: 'T', value: 't' },
  { name: 'U', value: 'u' },
  { name: 'V', value: 'v' },
  { name: 'W', value: 'w' },
  { name: 'X', value: 'x' },
  { name: 'Y', value: 'y' },
  { name: 'Z', value: 'z' },
  { name: '#', value: '0' },
];

// 活跃歌手类型
const activeType = ref('-1');
// 活跃地区
const activeArea = ref('-1');
// 活跃字母
const activeLetter = ref('-1');

// 歌手列表数据
const artists = ref([]);
// 总数
const total = ref(0);
// 加载状态
const loading = ref(false);
// 是否加载完毕
const finished = ref(false);

// 请求参数
const params = ref({
  limit: 30,
  offset: 0,
  type: '-1',
  area: '-1',
  initial: '-1'
});

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 不再需要单独的点击事件处理函数
// 使用watch监听就可以了

// 重置列表
const resetList = () => {
  // 重置所有状态
  params.value.offset = 0;
  artists.value = [];
  total.value = 0;
  finished.value = false;
  loading.value = false;
  
  // 使用nextTick而不是setTimeout，保证状态更新后再请求
  nextTick(() => {
    console.log('重置列表并重新加载');
    fetchArtists();
  });
};

// 获取歌手列表
const fetchArtists = async () => {
  // 防止重复请求的关键判断
  if (loading.value || finished.value) {
    console.log('已经在加载中或已加载完成，跳过请求');
    return;
  }
  
  // 先设置加载状态，防止重复请求
  loading.value = true;
  console.log('当前请求参数', { ...params.value });
  
  try {
    let res;
    
    if (params.value.type === '-1' && params.value.area === '-1') {
      // 如果是全部类型和全部地区，使用热门歌手接口
      res = await getTopArtists({
        limit: params.value.limit,
        offset: params.value.offset
      });
      
      // 处理热门歌手接口响应
      if (res.code === 200) {
        // 更新总数
        if (res.total) total.value = res.total;
        
        // 只有有数据时才添加到列表中
        if (res.artists && res.artists.length > 0) {
          artists.value = [...artists.value, ...res.artists];
          // 只有成功获取到数据时才往下索引
          params.value.offset += params.value.limit;
        }
        
        // 判断是否已经加载完毕
        if (!res.more || (res.artists && res.artists.length < params.value.limit)) {
          finished.value = true;
        }
      } else {
        finished.value = true;
      }
    } else {
      // 否则使用歌手分类列表接口
      res = await getArtistList({
        limit: params.value.limit,
        offset: params.value.offset,
        type: params.value.type,
        area: params.value.area,
        initial: params.value.initial
      });
      
      // 处理歌手分类列表接口响应
      if (res.code === 200) {
        // 更新总数
        if (res.count) total.value = res.count;
        
        // 只有有数据时才添加到列表中
        if (res.artists && res.artists.length > 0) {
          artists.value = [...artists.value, ...res.artists];
          // 只有成功获取到数据时才往下索引
          params.value.offset += params.value.limit;
        }
        
        // 判断是否已经加载完毕
        if (!res.more || (res.artists && res.artists.length < params.value.limit)) {
          finished.value = true;
        }
      } else {
        finished.value = true;
      }
    }
  } catch (error) {
    console.error('获取歌手列表失败:', error);
    showToast('获取歌手列表失败');
    finished.value = true; // 发生错误时标记为完成
  } finally {
    // 无论成功失败，最终都要重置loading状态
    loading.value = false;
  }
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

// 监听类型、地区和字母变化
const prevValues = {
  type: '-1',
  area: '-1',
  letter: '-1'
};

// 使用深度比较来防止重复触发
watch([() => activeType.value, () => activeArea.value, () => activeLetter.value], ([type, area, letter]) => {
  // 检查是否真正发生变化
  if (type === prevValues.type && area === prevValues.area && letter === prevValues.letter) {
    console.log('筛选条件未变化，跳过重置');
    return;
  }
  
  // 更新前值
  prevValues.type = type;
  prevValues.area = area;
  prevValues.letter = letter;
  
  // 更新请求参数
  params.value.type = type;
  params.value.area = area;
  params.value.initial = letter;
  console.log('筛选条件变化为', { type, area, letter }, '重置列表');
  resetList();
}, { immediate: false });

// 标签页的ref
const tabsRef = useTemplateRef('tabsRef');
const tabsHeight = ref(0);

// 处理标签页位置的函数
const handleTabsPosition = () => {
  if (tabsRef.value) {
    // 获取标签页元素的高度
    tabsHeight.value = tabsRef.value.offsetHeight;
    // 设置内容区域的上边距，等于标签页的高度+导航栏高度
    console.log('标签页高度：', tabsHeight.value);
  }
};

// 组件挂载后初始加载
onMounted(() => {
  fetchArtists();
  // 在下一个渲染周期执行，确保DOM已更新
  nextTick(() => {
    handleTabsPosition();
  });
});

// 在组件更新后重新计算标签页位置
onUpdated(() => {
  nextTick(() => {
    handleTabsPosition();
  });
});
</script>

<style scoped>
.artists-container {
  padding-bottom: 50px;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.artist-item {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.artist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 宽高比 */
}

.artist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; /* 确保图片不会覆盖在固定元素之上 */
}

.artist-info {
  padding: 8px;
}

.artist-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-count {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.total-info {
  font-size: 14px;
  color: #666;
}

.loading-container {
  padding: 20px;
  text-align: center;
}

.finished-text {
  text-align: center;
  padding: 10px 0;
  color: #999;
  font-size: 14px;
}

/* 增加底部空间，避免按钮被底部栏遮挡 */
.artists-container {
  padding-bottom: 80px;
}

/* 标签固定样式 */
#tabs {
  position: sticky;
  top: 46px; /* 导航栏高度 */
  z-index: 10;
  background: #fff;
}

/* 艺术家列表样式，添加顶部边距 */
.artists-grid {
  margin-top: 10px;
}
</style>
