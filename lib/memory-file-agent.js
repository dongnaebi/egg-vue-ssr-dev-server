'use strict'
const path = require('path')
const webpack = require('webpack')
const koaWebpack = require('koa-webpack')
const isTextPath = require('is-text-path')

class MemoryFileAgent {
  constructor (agent) {
    this.agent = agent
    if (!this.agent.config.vueSsrDevServer.publicPath || this.agent.config.vueSsrDevServer.publicPath === '/') {
      throw new Error('config option "publicPath" can not set empty or "/"')
    }
    this.runClient()
    this.runServer()
  }
  async runClient () {
    // client compile 'vue-ssr-client-manifest.json'
    const clientConfig = require(this.agent.config.vueSsrDevServer.clientConfig)
    const clientCompiler = webpack(clientConfig)
    const { devMiddleware } = await koaWebpack({
      compiler: clientCompiler
    })

    this.agent.messenger.on('request-client-file', filePath => {
      this.findFile(devMiddleware, filePath)
    })
  }
  async runServer () {
    // server compile 'vue-ssr-server-bundle.json'
    const serverConfig = require(this.agent.config.vueSsrDevServer.serverConfig)
    const serverCompiler = webpack(serverConfig)
    const { devMiddleware } = await koaWebpack({ compiler: serverCompiler, hotClient: false })

    this.agent.messenger.on('request-server-file', filePath => {
      this.findFile(devMiddleware, filePath)
    })
  }
  findFile (dev, filePath) {
    // this.agent.logger.info('request memory file: ' + filePath)
    dev.waitUntilValid(() => {
      let fileData
      const fs = dev.fileSystem
      const absPath = path.join(dev.context.compiler.outputPath, filePath)
      if (fs.existsSync(absPath)) {
        let encoding
        // Buffer(default) or String(txt extension)
        if (isTextPath(filePath)) {
          encoding = 'utf-8'
        }
        fileData = fs.readFileSync(absPath, encoding)
      }
      this.agent.messenger.sendToApp(
        fileData ? 'file-found' : 'file-not-found',
        { filePath, fileData }
      )
    })
  }
}

module.exports = MemoryFileAgent
