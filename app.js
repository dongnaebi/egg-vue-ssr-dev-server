const MemoryFileWorker = require('./lib/memory-file-worker')

module.exports = app => {
  if (app.config.env === 'local') {
    app.config.coreMiddleware.unshift('memoryFile')
    app.config.coreMiddleware.unshift('proxy')
  }
  app.messenger.on('egg-ready', () => {
    if (app.config.env === 'local') {
      app.memoryFileWorker = new MemoryFileWorker(app)
    }
  })
}
