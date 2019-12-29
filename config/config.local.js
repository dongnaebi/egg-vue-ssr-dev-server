/* eslint valid-jsdoc: "off" */

'use strict'

module.exports = appInfo => {
  const config = exports = {}
  config.keys = appInfo.name + '_1567785327174_6945'
  config.vueSsrDevServer = {
    serverConfig: 'app/build/webpack.server.config.js',
    clientConfig: 'app/build/webpack.client.config.js',
    publicPath: '/public/dist',
    proxy: {
      // '/api': {
      //   target: 'https://www.google.com',
      //   changeOrigin: true
      // }
    }
  }
  return {
    ...config
  }
}
