<template>
  <div class="comment-container">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="歌单评论"
      left-arrow
      fixed placeholder
      z-index="999"
      @click-left="onClickLeft"
    >
      <template #right>
        <div class="total-info" v-if="commentCount > 0">共{{commentCount}}条</div>
      </template>
    </van-nav-bar>
    
    <!-- 歌单信息区域 -->
    <div class="comment-header" v-if="playlistInfo">
      <div class="playlist-info">
        <div class="cover">
          <img :src="playlistInfo.coverImgUrl" alt="歌单封面">
        </div>
        <div class="info">
          <div class="name">{{ playlistInfo.name }}</div>
          <div class="creator">by {{ playlistInfo.creator?.nickname }}</div>
        </div>
      </div>
      <div class="playlist-action">
        <van-button 
          icon="apps-o"
          type="default" 
          size="small" 
          @click="goToSimiPlaylists"
        >
          查看相似歌单
        </van-button>
      </div>
    </div>
    
    <!-- 热门评论 -->
    <div class="comment-section hot-comments" v-if="hotComments.length > 0">
      <div class="section-title">热门评论</div>
      <div class="comment-list">
        <div class="comment-item" v-for="comment in hotComments" :key="'hot-' + comment.commentId">
          <div class="avatar">
            <img :src="comment.user.avatarUrl" :alt="comment.user.nickname">
          </div>
          <div class="content">
            <div class="username-time">
              <span class="username">{{ comment.user.nickname }}</span>
              <span class="time">{{ formatCommentTime(comment.time) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="likes">
              <van-icon name="good-job-o" /> {{ comment.likedCount > 0 ? comment.likedCount : '点赞' }}
            </div>
            <!-- 回复评论 -->
            <div class="replies" v-if="comment.beReplied && comment.beReplied.length > 0">
              <div class="reply-item" v-for="reply in comment.beReplied" :key="reply.beRepliedCommentId">
                <span class="reply-username">@{{ reply.user.nickname }}:</span>
                <span class="reply-content">{{ reply.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最新评论 -->
    <div class="comment-section new-comments" v-if="comments.length > 0">
      <div class="section-title">最新评论</div>
      <div class="comment-list">
        <div class="comment-item" v-for="comment in comments" :key="comment.commentId">
          <div class="avatar">
            <img :src="comment.user.avatarUrl" :alt="comment.user.nickname">
          </div>
          <div class="content">
            <div class="username-time">
              <span class="username">{{ comment.user.nickname }}</span>
              <span class="time">{{ formatCommentTime(comment.time) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="likes">
              <van-icon name="good-job-o" /> {{ comment.likedCount > 0 ? comment.likedCount : '点赞' }}
            </div>
            <!-- 回复评论 -->
            <div class="replies" v-if="comment.beReplied && comment.beReplied.length > 0">
              <div class="reply-item" v-for="reply in comment.beReplied" :key="reply.beRepliedCommentId">
                <span class="reply-username">@{{ reply.user.nickname }}:</span>
                <span class="reply-content">{{ reply.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 无评论提示 -->
    <div class="empty-comment" v-if="!loading && comments.length === 0 && hotComments.length === 0">
      <van-empty description="暂无评论" />
    </div>
    
    <!-- 加载状态和加载更多 -->
    <div class="loading-container">
      <van-loading v-if="loading" type="spinner" color="#1989fa" />
      <div v-else-if="finished" class="finished-text">没有更多评论了</div>
      <van-button 
        v-else 
        type="primary" 
        size="small" 
        block 
        :disabled="loading" 
        @click="fetchComments"
      >
        加载更多
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getPlaylistComments, getHotComments, getPlaylistDetail, getSimiPlaylist } from '@/apis/music';
import { formatPlayCount } from '@/utils/tools';

const route = useRoute();
const router = useRouter();

// 歌单ID
const playlistId = ref('');
// 评论总数
const commentCount = ref(0);
// 评论列表
const comments = ref([]);
// 热门评论
const hotComments = ref([]);
// 歌单信息
const playlistInfo = ref(null);

// 分页参数
const params = ref({
  id: '',
  limit: 20,
  offset: 0,
  before: 0
});

// 加载状态
const loading = ref(false);
// 是否加载完毕
const finished = ref(false);

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 跳转到相似歌单页面
const goToSimiPlaylists = async () => {
  if (!playlistId.value) {
    showToast('歌单ID不存在');
    return;
  }
  
  try {
    // 加载提示
    showToast({
      type: 'loading',
      message: '加载中...',
      forbidClick: true,
      duration: 0
    });
    
    // 调用相似歌单API
    const res = await getSimiPlaylist({ id: playlistId.value });
    
    // 关闭提示
    showToast.clear();
    
    if (res.code === 200 && res.playlists && res.playlists.length > 0) {
      // 这里可以将相似歌单数据传递给相似歌单页面
      // 由于没有现成的相似歌单页面，可以先建立一个路由参数传递方式
      router.push({
        path: '/simi-playlists',
        query: {
          id: playlistId.value,
          name: playlistInfo.value?.name || ''
        }
      });
    } else {
      showToast('没有找到相似歌单');
    }
  } catch (error) {
    console.error('获取相似歌单失败:', error);
    showToast('获取相似歌单失败');
  }
};

// 获取评论数据
const fetchComments = async () => {
  // 防止重复请求
  if (loading.value || finished.value) {
    return;
  }
  
  loading.value = true;
  
  try {
    const res = await getPlaylistComments({
      id: params.value.id,
      limit: params.value.limit,
      offset: params.value.offset,
      before: params.value.before
    });
    
    if (res.code === 200) {
      // 更新总数
      commentCount.value = res.total;
      
      // 添加评论到列表
      if (res.comments && res.comments.length > 0) {
        comments.value = [...comments.value, ...res.comments];
        // 更新分页参数
        params.value.offset += params.value.limit;
        
        // 获取最后一条评论时间作为before参数
        if (res.comments.length > 0) {
          params.value.before = res.comments[res.comments.length - 1].time;
        }
      }
      
      // 判断是否加载完毕
      if (!res.more || (res.comments && res.comments.length < params.value.limit)) {
        finished.value = true;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    console.error('获取评论失败:', error);
    showToast('获取评论失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 获取热门评论
const fetchHotComments = async () => {
  try {
    const res = await getHotComments({
      id: params.value.id,
      type: 2, // 2代表歌单类型
      limit: 10
    });
    
    if (res.code === 200 && res.hotComments) {
      hotComments.value = res.hotComments;
    }
  } catch (error) {
    console.error('获取热门评论失败:', error);
  }
};

// 获取歌单信息
const fetchPlaylistInfo = async () => {
  try {
    const res = await getPlaylistDetail({
      id: playlistId.value
    });
    
    if (res.code === 200 && res.playlist) {
      playlistInfo.value = res.playlist;
      commentCount.value = res.playlist.commentCount || 0;
    }
  } catch (error) {
    console.error('获取歌单信息失败:', error);
  }
};

// 格式化评论时间
const formatCommentTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  }
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  }
  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
  }
  
  // 日期格式化
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 初始化
onMounted(() => {
  // 获取路由参数
  if (route.query.id) {
    playlistId.value = route.query.id;
    params.value.id = playlistId.value;
    
    // 获取歌单信息
    fetchPlaylistInfo();
    // 获取热门评论
    fetchHotComments();
    // 获取最新评论
    fetchComments();
  } else {
    showToast('参数错误');
    router.back();
  }
});
</script>

<style lang="scss" scoped>
.comment-container {
  min-height: 100vh;
  padding-bottom: 80px;
}

.total-info {
  font-size: 14px;
  color: #999;
}

.comment-header {
  padding: 16px;
  background-color: #fff;
  margin-bottom: 10px;
  
  .playlist-info {
    display: flex;
    align-items: center;
    
    .cover {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .info {
      flex: 1;
      overflow: hidden;
      
      .name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .creator {
        font-size: 13px;
        color: #666;
      }
    }
  }
}

.section-title {
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  background-color: #f5f5f5;
}

.comment-list {
  background-color: #fff;
}

.comment-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .content {
    flex: 1;
    
    .username-time {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      
      .username {
        font-size: 14px;
        color: #507daf;
      }
      
      .time {
        font-size: 12px;
        color: #999;
      }
    }
    
    .comment-content {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 8px;
      color: #333;
    }
    
    .likes {
      font-size: 13px;
      color: #999;
      display: flex;
      align-items: center;
      
      .van-icon {
        margin-right: 4px;
      }
    }
    
    .replies {
      margin-top: 8px;
      padding: 10px;
      background-color: #f8f8f8;
      border-radius: 4px;
      
      .reply-item {
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 1.4;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
      
      .reply-username {
        color: #507daf;
        margin-right: 4px;
      }
      
      .reply-content {
        color: #333;
      }
    }
  }
}

.empty-comment {
  padding: 60px 0;
}

.loading-container {
  padding: 20px;
  text-align: center;
}

.finished-text {
  padding: 16px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
