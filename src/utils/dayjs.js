import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime' // 导入相对时间插件
import duration from 'dayjs/plugin/duration' // 导入时长插件

// 配置语言为中文
dayjs.locale('zh-cn')

// 添加相对时间插件
dayjs.extend(relativeTime)

// 添加时长插件
dayjs.extend(duration)

/**
 * 格式化日期
 * @param {String|Number|Date} date 日期
 * @param {String} format 格式
 * @returns {String}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format)
}

/**
 * 获取相对时间
 * @param {String|Number|Date} date 日期
 * @param {String|Number|Date} relativeDate 相对日期，默认为当前时间
 * @returns {String}
 */
export function fromNow(date, relativeDate) {
  return dayjs(date).from(relativeDate || dayjs())
}

/**
 * 格式化时长（秒转为时分秒）
 * @param {Number} seconds 秒数
 * @returns {String}
 */
export function formatDuration(seconds) {
  const duration = dayjs.duration(seconds, 'seconds')
  
  const hours = duration.hours()
  const minutes = duration.minutes()
  const secs = duration.seconds()
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export default dayjs
