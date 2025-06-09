import { get } from '../utils/request'

/**
 * 获取默认搜索关键词
 * @returns {Promise} 默认搜索关键词信息
 */
export function getSearchDefault() {
  return get('/search/default')
}

/**
 * 获取精品歌单
 * @param {Object} params 可选参数
 * @param {String} params.cat 歌单分类tag，例如："华语"、"古风"、"欧美"、"流行"，默认为"全部"
 * @param {Number} params.limit 取出歌单数量，默认为50
 * @param {Number} params.before 分页参数，取上一页最后一个歌单的updateTime获取下一页数据
 * @returns {Promise} 精品歌单列表
 */
export function getTopPlaylistHighquality(params = {}) {
  return get('/top/playlist/highquality', params)
}

/**
 * 获取精品歌单标签列表
 * @returns {Promise} 精品歌单标签列表
 */
export function getHighqualityTags() {
  return get('/playlist/highquality/tags')
}

/**
 * 获取轮播图数据
 * @param {Object} params 可选参数
 * @param {Number} params.type 资源类型，0: PC, 1: Android, 2: iPhone, 3: iPad
 * @returns {Promise} 轮播图数据
 */
export function getBanners(params = { type: 3 }) {
  return get('/banner', params)
}

/**
 * 获取新歌速递
 * @param {Object} params 可选参数
 * @param {Number} params.type 地区类型 id, 0: 全部, 7: 华语, 96: 欧美, 8: 日本, 16: 韩国
 * @returns {Promise} 新歌速递数据
 */
export function getTopSongs(params = { type: 7 }) {
  return get('/top/song', params)
}

/**
 * 获取热门歌手
 * @param {Object} params 可选参数
 * @param {Number} params.limit 取出数量，默认为 50
 * @param {Number} params.offset 偏移数量，用于分页，如 :(页数-1)*50
 * @returns {Promise} 热门歌手数据
 */
export function getTopArtists(params = { offset: 0, limit: 6 }) {
  return get('/top/artists', params)
}

/**
 * 获取歌手详情动态
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手详情动态数据
 */
export function getArtistDetailDynamic(params) {
  return get('/artist/detail/dynamic', params)
}

/**
 * 获取歌手分类列表
 * @param {Object} params 可选参数
 * @param {Number} params.limit 返回数量，默认为 30
 * @param {Number} params.offset 偏移数量，用于分页
 * @param {Number} params.initial 按首字母索引查找参数，热门传-1，#传 0
 * @param {Number} params.type 类型，-1:全部, 1:男歌手, 2:女歌手, 3:乐队
 * @param {Number} params.area 地区，-1:全部, 7:华语, 96:欧美, 8:日本, 16:韩国, 0:其他
 * @returns {Promise} 歌手分类列表
 */
export function getArtistList(params = { type: -1, area: -1, initial: -1, limit: 30, offset: 0 }) {
  return get('/artist/list', params)
}

/**
 * 获取歌手热门 50 首歌曲
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手热门歌曲数据
 */
export function getArtistTopSongs(params) {
  return get('/artist/top/song', params)
}

/**
 * 获取歌手全部歌曲
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @param {String} params.order hot,time 排序方式
 * @param {Number} params.limit 取出数量，默认为 50
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 歌手全部歌曲数据
 */
export function getArtistSongs(params) {
  return get('/artist/songs', params)
}

/**
 * 获取歌手单曲
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手单曲数据
 */
export function getArtist(params) {
  return get('/artists', params)
}

/**
 * 获取歌手 MV
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手 MV 数据
 */
export function getArtistMV(params) {
  return get('/artist/mv', params)
}

/**
 * 获取歌手专辑
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @param {Number} params.limit 取出数量，默认为 30
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 歌手专辑数据
 */
export function getArtistAlbum(params) {
  return get('/artist/album', params)
}

/**
 * 获取歌手描述
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手描述数据
 */
export function getArtistDesc(params) {
  return get('/artist/desc', params)
}

/**
 * 获取歌手详情
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 歌手详情数据
 */
export function getArtistDetail(params) {
  return get('/artist/detail', params)
}

/**
 * 获取相似歌手
 * @param {Object} params 参数
 * @param {Number} params.id 歌手 ID
 * @returns {Promise} 相似歌手数据
 */
export function getSimiArtist(params) {
  return get('/simi/artist', params)
}

/**
 * 获取歌手榜
 * @param {Object} params 可选参数
 * @param {Number} params.type 地区类型，1: 华语, 2: 欧美, 3: 韩国, 4: 日本
 * @returns {Promise} 歌手榜数据
 */
export function getToplistArtist(params = { type: 1 }) {
  return get('/toplist/artist', params)
}

/**
 * 获取热搜列表(简略)
 * @returns {Promise} 热搜关键词列表
 */
export function getSearchHot() {
  return get('/search/hot')
}

/**
 * 搜索多重匹配
 * @param {Object} params 参数
 * @param {String} params.keywords 搜索关键词
 * @returns {Promise} 搜索多重匹配结果
 */
export function searchSuggest(params) {
  return get('/search/suggest', params)
}

/**
 * 获取歌曲URL
 * @param {Object} params 参数
 * @param {String} params.id 歌曲ID
 * @returns {Promise} 歌曲URL信息
 */
export function getSongUrl(params) {
  return get('/song/url', params)
}

/**
 * 获取歌曲详情
 * @param {Object} params 参数
 * @param {String} params.ids 歌曲ID，可以是多个，用逗号隔开
 * @returns {Promise} 歌曲详情
 */
export function getSongDetail(params) {
  return get('/song/detail', params)
}

/**
 * 获取歌单详情
 * @param {Object} params 参数
 * @param {Number} params.id 歌单ID
 * @param {Number} params.s 歌单最近的s个收藏者，默认为8
 * @returns {Promise} 歌单详情
 */
export function getPlaylistDetail(params) {
  return get('/playlist/detail', params)
}

/**
 * 获取歌单评论
 * @param {Object} params 参数
 * @param {Number} params.id 歌单ID
 * @param {Number} params.limit 取出数量，默认为 20
 * @param {Number} params.offset 偏移数量，用于分页，如 :(页数-1)*20
 * @param {Number} params.before 分页参数，取上一页最后一项的time获取下一页数据
 * @returns {Promise} 歌单评论数据
 */
export function getPlaylistComments(params = { limit: 20, offset: 0 }) {
  return get('/comment/playlist', params)
}

/**
 * 获取热门评论
 * @param {Object} params 参数
 * @param {Number} params.id 资源ID
 * @param {Number} params.type 资源类型，0: 歌曲, 1: MV, 2: 歌单, 3: 专辑, 4: 电台, 5: 视频
 * @param {Number} params.limit 取出数量，默认为 20
 * @param {Number} params.offset 偏移数量，用于分页，如 :(页数-1)*20
 * @returns {Promise} 热门评论数据
 */
export function getHotComments(params = { limit: 20, offset: 0 }) {
  return get('/comment/hot', params)
}

/**
 * 获取相似歌单
 * @param {Object} params 参数
 * @param {Number} params.id 歌单ID
 * @returns {Promise} 相似歌单数据
 */
export function getSimiPlaylist(params) {
  return get('/simi/playlist', params)
}

/**
 * 获取推荐歌单
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 30
 * @returns {Promise} 推荐歌单数据
 */
export function getPersonalized(params = { limit: 30 }) {
  return get('/personalized', params)
}

/**
 * 获取MV排行榜
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 30
 * @param {String} params.area 地区，可选值为内地,港台,欧美,日本,韩国
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} MV排行榜数据
 */
export function getTopMv(params = { limit: 10 }) {
  return get('/top/mv', params)
}

/**
 * 获取MV详情
 * @param {Object} params 参数
 * @param {Number} params.mvid MV ID
 * @returns {Promise} MV详情数据
 */
export function getMvDetail(params) {
  return get('/mv/detail', params)
}

/**
 * 获取MV点赞转发评论数
 * @param {Object} params 参数
 * @param {Number} params.mvid MV ID
 * @returns {Promise} MV点赞转发评论数据
 */
export function getMvDetailInfo(params) {
  return get('/mv/detail/info', params)
}

/**
 * 获取MV播放地址
 * @param {Object} params 参数
 * @param {Number} params.id MV ID
 * @param {Number} params.r 分辨率，默认 1080
 * @returns {Promise} MV播放地址数据
 */
export function getMvUrl(params) {
  return get('/mv/url', params)
}

/**
 * 获取网易出品MV
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 30
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 网易出品MV数据
 */
export function getExclusiveMv(params = { limit: 10 }) {
  return get('/mv/exclusive/rcmd', params)
}

/**
 * 获取全部MV
 * @param {Object} params 参数
 * @param {String} params.area 地区，可选值为全部,内地,港台,欧美,日本,韩国
 * @param {String} params.type 类型，可选值为全部,官方版,原生,现场版,网易出品
 * @param {String} params.order 排序，可选值为上升最快,最热,最新
 * @param {Number} params.limit 取出数量，默认为 30
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 全部MV数据
 */
export function getAllMv(params = { limit: 10 }) {
  return get('/mv/all', params)
}

/**
 * 获取推荐新音乐
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 10
 * @returns {Promise} 推荐新音乐数据
 */
export function getPersonalizedNewSong(params = { limit: 10 }) {
  return get('/personalized/newsong', params)
}

/**
 * 获取推荐电台
 * @returns {Promise} 推荐电台数据
 */
export function getPersonalizedDjProgram() {
  return get('/personalized/djprogram')
}

/**
 * 获取推荐节目
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 10
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 推荐节目数据
 */
export function getRecommendProgram(params = { limit: 10, offset: 0 }) {
  return get('/program/recommend', params)
}

/**
 * 获取最新专辑
 * @returns {Promise} 最新专辑数据
 */
export function getNewestAlbum() {
  return get('/album/newest')
}

/**
 * 获取专辑动态信息
 * @param {Object} params 参数
 * @param {Number} params.id 专辑 ID
 * @returns {Promise} 专辑动态信息
 */
export function getAlbumDetailDynamic(params) {
  return get('/album/detail/dynamic', params)
}

/**
 * 获取专辑内容
 * @param {Object} params 参数
 * @param {Number} params.id 专辑 ID
 * @returns {Promise} 专辑内容
 */
export function getAlbum(params) {
  return get('/album', params)
}

/**
 * 获取热门话题
 * @param {Object} params 参数
 * @param {Number} params.limit 取出数量，默认为 20
 * @param {Number} params.offset 偏移数量，用于分页
 * @returns {Promise} 热门话题数据
 */
export function getHotTopic(params = { limit: 20, offset: 0 }) {
  return get('/hot/topic', params)
}

/**
 * 获取话题详情
 * @param {Object} params 参数
 * @param {Number} params.actid 话题ID
 * @returns {Promise} 话题详情数据
 */
export function getTopicDetail(params) {
  return get('/topic/detail', params)
}

/**
 * 获取话题详情热门动态
 * @param {Object} params 参数
 * @param {Number} params.actid 话题ID
 * @returns {Promise} 话题详情热门动态数据
 */
export function getTopicDetailEventHot(params) {
  return get('/topic/detail/event/hot', params)
}
