import axios from 'axios'

const baseURL = process.env.VUE_APP_API_BASE_URL
// 创建 axios 实例
const instance = axios.create({
  baseURL: baseURL, // api base_url
  timeout: 600000 // 请求超时时间
})

instance.postFile = function (
  url,
  params,
  config = {
    headers: {'content-type': 'application/octet-stream;charset=UTF-8'},
    responseType: 'blob'
  }
) {
  // const urlObj = new FormData();
  // for (var i in params) {
  //     urlObj.append(i, params[i])
  // }
  return this.post(url, params, config)
}
instance.getFile = function (
  url,
  params = {},
  config = {
    headers: {'content-type': 'application/octet-stream;charset=UTF-8'},
    responseType: 'blob'
  }
) {
  return this.get(url, config)
}

instance.postFormUrlencoded = function (url, parsame = {}, config = {}) {
  var data = ''
  if (!config.headers) {
    config.headers = {}
  }
  if (config.noLoading) {
    config.headers.noLoading = config.noLoading
  }
  config.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
  Object.keys(parsame).forEach((key, i) => {
    let val = ''
    switch (typeof parsame[key]) {
      case 'Object':
        val = JSON.stringify(parsame[key])
        break
      default:
        val = parsame[key]
    }
    data += `${i === 0 ? '' : '&'}${key}=${val}`
  })
  return this.post(url, data, config)
}

instance.getFormUrlencoded = function (url, params = {}, config = {}) {
  var urlCopy = url
  let type = '?'
  if (!config.headers) {
    config.headers = {}
  }
  if (config.noLoading) {
    config.headers.noLoading = config.noLoading
  }
  config.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

  config.params = params
  // Object.keys(params).forEach((key, i) => {
  //     let val = params[key]
  //     urlCopy += `${type}${key}=${val}`
  //     type = '&'
  //         // if (typeof val !== 'undefined' && val !== null && val !== '') {
  //         //     urlCopy += `${type}${key}=${params[key]}`
  //         //     type = '&'
  //         // }

  // })
  return this.get(urlCopy, config)
}

instance.postFrom = function (url, params, config = {}) {
  const urlObj = new FormData()
  if (!config.headers) {
    config.headers = {}
  }
  if (config.noLoading) {
    config.headers.noLoading = config.noLoading
  }
  config.headers['content-type'] = 'multipart/form-data'
  for (var i in params) {
    urlObj.append(i, params[i])
  }
  return this.post(url, urlObj, config)
}

instance.getAjax = function (url, parmes = {}, config = {}) {
  var urlCopy = url
  config.parmes = parmes
  return this.get(urlCopy, config)
}

export default instance
