/* eslint valid-jsdoc: "off" */

'use strict'
const path = require('path')
module.exports = appInfo => {
  const config = exports = {}
  // config.middleware = ['notfoundHandler']
  config.vueSsrDevServer = {
    serverConfig: 'app/build/webpack.server.config.js',
    clientConfig: 'app/build/webpack.server.config.js',
    outputPath: 'public/dist',
    public: '/public/dist/'
  }
  return {
    ...config
  }
}
