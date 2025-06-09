/**
 * 封装本地存储操作
 */

/**
 * 存储localStorage
 * @param {String} key 键
 * @param {any} value 值
 * @param {Number} expire 过期时间（毫秒），可选
 */
export function setLocalStorage(key, value, expire) {
  try {
    if (expire) {
      const data = {
        value,
        expire: Date.now() + expire
      }
      localStorage.setItem(key, JSON.stringify(data))
    } else {
      if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value))
      } else {
        localStorage.setItem(key, value)
      }
    }
  } catch (error) {
    console.error('localStorage存储失败', error)
  }
}

/**
 * 获取localStorage
 * @param {String} key 键
 * @returns {any}
 */
export function getLocalStorage(key) {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null
    
    try {
      // 尝试解析JSON
      const parsed = JSON.parse(value)
      
      // 判断是否设置了过期时间
      if (parsed && typeof parsed === 'object' && parsed.expire) {
        if (Date.now() > parsed.expire) {
          // 已过期，删除并返回null
          localStorage.removeItem(key)
          return null
        }
        return parsed.value
      }
      
      return parsed
    } catch (error) {
      // 非JSON格式，直接返回
      return value
    }
  } catch (error) {
    console.error('localStorage获取失败', error)
    return null
  }
}

/**
 * 移除localStorage
 * @param {String} key 键
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('localStorage移除失败', error)
  }
}

/**
 * 存储sessionStorage
 * @param {String} key 键
 * @param {any} value 值
 */
export function setSessionStorage(key, value) {
  try {
    if (typeof value === 'object') {
      sessionStorage.setItem(key, JSON.stringify(value))
    } else {
      sessionStorage.setItem(key, value)
    }
  } catch (error) {
    console.error('sessionStorage存储失败', error)
  }
}

/**
 * 获取sessionStorage
 * @param {String} key 键
 * @returns {any}
 */
export function getSessionStorage(key) {
  try {
    const value = sessionStorage.getItem(key)
    if (!value) return null
    
    try {
      // 尝试解析JSON
      return JSON.parse(value)
    } catch (error) {
      // 非JSON格式，直接返回
      return value
    }
  } catch (error) {
    console.error('sessionStorage获取失败', error)
    return null
  }
}

/**
 * 移除sessionStorage
 * @param {String} key 键
 */
export function removeSessionStorage(key) {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('sessionStorage移除失败', error)
  }
}
