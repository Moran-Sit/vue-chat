const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  lintOnSave: false,
  productionSourceMap: isProd,
  publicPath: isProd ? '/vue-beautiful-chat/' : '/',
  devServer: {
    // development server port 8000
    port: 8080,
    // disableHostCheck: true,
    host: '0.0.0.0',
    proxy: {
      '^/ai': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true, //是否跨域
        pathRewrite(path) {
          return path.replace('/ai', '')
        }
      }
    }
    // overlay: {
    //     warnings: false,
    //     errors: false
    // },
    // lintOnSave: false
  }
}
