const mime = require('mime')
const isTextPath = require('is-text-path')

module.exports = (options, app) => {
  return async (ctx, next) => {
    if (app.config.env === 'local') {
      const filePath = ctx.request.path
      const publicPathIndex = filePath.indexOf(app.config.vueSsrDevServer.publicPath)
      if (publicPathIndex > -1) {
        // resolve /public path problem in egg
        /* let pathArr = filePath.split(app.config.vueSsrDevServer.publicPath)
        const fileName = pathArr[pathArr.length - 1] */
        const fileName = filePath.substring(publicPathIndex + app.config.vueSsrDevServer.publicPath.length)

        let fileData
        try {
          fileData = await app.memoryFileWorker.requestClientFile(fileName)
          ctx.response.type = mime.getType(fileName)
          if (!isTextPath(fileName)) {
            fileData = Buffer.from(fileData)
          }
        } catch (err) {
          ctx.status = 404
          fileData = err
        }
        ctx.body = fileData
      } else {
        await next()
      }
    } else {
      await next()
    }
  }
}
