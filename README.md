# Vue3 H5 音乐播放器

## 项目介绍

一款基于Vue3开发的移动端音乐播放器应用，提供音乐播放、MV观看、歌单管理等功能。项目使用了最新的Vue3技术栈，结合Vant UI组件库，呈现出美观、流畅的用户体验。

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **UI组件库**：Vant UI 4.x
- **状态管理**：Pinia
- **路由管理**：Vue Router 4.x
- **HTTP请求**：Axios
- **CSS预处理器**：SCSS

## 功能特性

- 🎵 **音乐播放**：支持播放/暂停、上一首/下一首、播放模式切换，且各组件间播放控制同步
- 📱 **全局播放器**：支持迷你播放器和全屏播放页
- 🔄 **播放模式**：支持顺序播放、单曲循环和随机播放三种模式
- 📋 **歌单管理**：推荐歌单、歌单详情浏览
- 🎬 **MV播放**：支持多种分辨率（480p/720p/1080p）切换
- 💿 **专辑详情**：浏览专辑信息、歌曲列表及一键播放功能
- 👨‍🎤 **歌手详情页**：展示歌手的热门歌曲、所有专辑、相关MV
- 💿 **专辑详情页**：展示专辑的所有歌曲、基本信息
- 📜 **播放历史**：自动记录本地歌曲及MV播放历史，支持批量选择、搜索过滤及批量操作
- 📱 **微信环境检测**：优化微信内浏览体验，提供在浏览器打开提示
- 🔍 **搜索功能**：支持歌曲、歌单、歌手等搜索
- 💬 **评论系统**：查看歌曲、歌单、MV评论
- 💾 **状态持久化**：支持刷新页面后保留播放状态、历史记录等数据
- 🐋 **跨页面自适应**：播放器在不同页面中自适应布局，保证良好的用户体验

## API接口

本项目使用开源的网易云音乐API，接口文档参考：[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

主要使用的API接口包括：

- 获取推荐歌单：`/personalized`
- 获取歌单详情：`/playlist/detail`
- 获取歌曲URL：`/song/url/v1`
- 获取歌曲详情：`/song/detail`
- 获取MV详情：`/mv/detail`
- 获取MV播放地址：`/mv/url` (支持分辨率参数r)
- 获取相似MV：`/simi/mv`
- 获取评论：`/comment`系列接口
- 搜索接口：`/search`系列接口

## 项目结构

```
├── public/             # 静态资源目录
├── src/                # 源代码目录
│   ├── apis/           # API接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   │   ├── MiniPlayer.vue  # 迷你播放器组件
│   │   └── PlayerPage.vue  # 全屏播放页组件
│   ├── router/         # 路由配置
│   ├── store/          # Pinia状态管理
│   │   └── modules/    # 模块化的store
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   │   ├── home/       # 首页
│   │   ├── playlist/   # 歌单相关页面
│   │   ├── mv/         # MV相关页面
│   │   ├── artist/     # 歌手相关页面
│   │   └── search/     # 搜索相关页面
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html          # HTML入口文件
└── vite.config.js      # Vite配置文件
```

## 运行项目

### 环境要求

- Node.js: v16.0.0 或更高版本
- pnpm: v7.0.0 或更高版本
- Vue: v3.3.x
- Vite: v4.x

### 安装与运行

本项目使用 pnpm 作为包管理工具，请先安装 pnpm：

```bash
# 全局安装 pnpm
npm install -g pnpm

# 检查版本
pnpm -v
```

然后执行以下命令运行项目：

```bash
# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建生产版本
pnpm build
```

## 项目亮点

1. 使用Vue3 Composition API，代码组织更清晰
2. 使用Pinia进行状态管理，实现全局播放器功能
3. 支持MV多种分辨率切换功能
4. 移动端友好的UI设计，基于Vant组件库
5. 全局播放器与迷你播放器无缝切换
