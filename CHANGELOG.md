# 更新日志

## 2025-06-11

### 功能增强

- 🎵 **歌曲详情页优化**：
  - 重构歌曲详情页布局，优化信息展示结构
  - 将播放按钮移至歌曲标题右侧，提升操作便捷性
  - 完善播放控制状态同步，支持播放/暂停状态切换
  - 优化无版权歌曲的提示和禁用状态显示
  - 添加单曲/专辑类型标识显示

### 问题修复

### 问题修复

- 🔄 **播放控制同步问题**：
  - 修复歌单列表与迷你播放器之间的播放控制同步问题
  - 优化在专辑详情页中的播放控制逻辑
  - 修复当前歌曲高亮显示逻辑，防止不同歌曲同时高亮的问题
  - 移除基于索引的判断逻辑，改为直接比较歌曲对象

## 2025-06-10

### 新功能

- ⚙️ **设置页面**：
  - 新增设置页面，支持自定义迷你播放器样式
  - 支持修改背景颜色、文字颜色、进度条颜色、图标颜色等属性
  - 提供实时预览功能，立即看到样式效果
  - 支持一键重置样式为默认值
  - 配置持久化保存，重启应用后保持用户设置
  
- 🔇 **播放器显示控制**：
  - 支持指定特定路径不显示播放器
  - 使用路径匹配移除播放器与特定页面的冲突

- ✨ **播放历史功能增强**：
  - 新增歌曲历史多选模式，支持批量选择、批量添加到播放列表、批量删除
  - 新增历史搜索功能，可按歌曲名或歌手过滤
  - 点击历史歌曲只添加到播放列表而不触发立即播放
  - 增强弹窗关闭行为，点击空白处可关闭
  
- 💾 **状态持久化**：
  - 添加Pinia状态持久化支持，页面刷新后保留播放状态
  - 保存播放历史、播放列表、当前歌曲等重要数据
  - 新增播放器跨页面态自适应布局，解决与底部导航栏冲突

### 功能改进

- ✨ **播放模式功能增强**：
  - 修复了播放模式切换功能，现在可以正常在顺序播放、单曲循环和随机播放三种模式间切换
  - 添加切换模式时的Toast提示，提供良好的用户反馈
  - 修复了随机播放模式的图标显示问题，现在使用iconfont图标

- 🎨 **UI改进**：
  - 增强了正在播放歌曲的高亮效果，增加左侧彩色边条、字体颜色和加粗等视觉提示
  - 优化列表中当前播放歌曲的视觉反馈，让用户一目了然地识别当前播放的歌曲

- 🧹 **代码优化**：
  - 将SCSS变量和混入移至外部variables.scss文件，提高了样式代码的可维护性
  - 清理了组件中的无用代码和重复定义
  - 移除了历史残留的代码冗余

- 🔧 **其他改进**：
  - 增加了清空播放列表的确认对话框，防止误操作
  - 修复了部分样式问题，提高界面美观度

### Bug 修复

- 🐛 修复播放模式切换无效的问题
- 🐛 修复设置页面路径自动补全功能在清空输入后不显示建议列表的问题
- 🐛 优化设置页面中迷你播放器预览，避免在设置页面触发播放逻辑
- 🐛 改进路径选择下拉列表的交互体验，支持多选和批量添加
- 🐛 修复图标显示异常问题
