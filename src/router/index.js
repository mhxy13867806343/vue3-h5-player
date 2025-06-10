import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/home/index.vue'),
    meta: {
      title: '发现音乐',
      keepAlive: true,
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/search/index.vue'),
    meta: {
      title: '搜索',
      keepAlive: false,
    },
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('../views/playlist/index.vue'),
    meta: {
      title: '精品歌单',
      keepAlive: true,
    },
  },
  {
    path: '/playlist-detail',
    name: 'PlaylistDetail',
    component: () => import('../views/playlist/detail.vue'),
    meta: {
      title: '歌单详情',
      keepAlive: false,
    },
  },
  {
    path: '/comment/playlist',
    name: 'PlaylistComment',
    component: () => import('../views/comment/playlist.vue'),
    meta: {
      title: '歌单评论',
      keepAlive: false,
    },
  },
  {
    path: '/simi-playlists',
    name: 'SimiPlaylists',
    component: () => import('../views/playlist/similar.vue'),
    meta: {
      title: '相似歌单',
      keepAlive: false,
    },
  },
  {
    path: '/artists',
    name: 'Artists',
    component: () => import('../views/artist/list.vue'),
    meta: {
      title: '热门歌手',
      keepAlive: true,
    },
  },
  {
    path: '/artist',
    name: 'ArtistDetail',
    component: () => import('../views/artist/index.vue'),
    meta: {
      title: '歌手详情',
      keepAlive: false,
    },
  },
  {
    path: '/recommended-playlists',
    name: 'RecommendedPlaylists',
    component: () => import('../views/playlist/recommended.vue'),
    meta: {
      title: '推荐歌单',
      keepAlive: true,
    },
  },
  {
    path: '/top-mv',
    name: 'TopMV',
    component: () => import('../views/mv/top-list.vue'),
    meta: {
      title: 'MV排行',
      keepAlive: true,
    },
  },
  {
    path: '/mv-detail',
    name: 'MVDetail',
    component: () => import('../views/mv/detail.vue'),
    meta: {
      title: 'MV详情',
      keepAlive: false,
    },
  },
  {
    path: '/new-songs',
    name: 'NewSongs',
    component: () => import('../views/song/new-songs.vue'),
    meta: {
      title: '新音乐',
      keepAlive: true,
    },
  },
  {
    path: '/album-details',
    name: 'AlbumDetails',
    component: () => import('../views/album/album-details.vue'),
    meta: {
      title: '专辑详情',
      keepAlive: true,
    },
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/user/index.vue'),
    meta: {
      title: '我的音乐',
      keepAlive: true,
    },
  },
    {
    path: '/setting',
    name: 'Setting',
    component: () => import('../views/setting/index.vue'),
    meta: {
      title: '设置',
      keepAlive: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: {
      title: '页面不存在',
      keepAlive: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '媒体播放器'
  next()
})

export default router
