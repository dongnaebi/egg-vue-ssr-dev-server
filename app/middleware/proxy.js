const httpProxy = require('http-proxy-middleware')
const k2c = require('koa2-connect')

module.exports = (options, app) => {
  return async (ctx, next) => {
    if (app.config.env === 'local') {
      const proxyTable = app.config.vueSsrDevServer.proxy
      const keys = Object.keys(proxyTable)
      let matched = keys.filter(k => ctx.path.indexOf(k) === 0)
      if (matched.length) {
        matched.sort((a, b) => b.length - a.length)
        await k2c(httpProxy(proxyTable[matched[0]]))(ctx, next)
      }
    }
    await next()
  }
}
