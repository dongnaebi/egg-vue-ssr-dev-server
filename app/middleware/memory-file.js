const mime = require('mime');
const path = require('path');
const isTextPath = require('is-text-path')

module.exports = (options, app) => {
  return async (ctx, next) => {
    await next();
    // todo 改成判断path里是否包含publicPath
    if (ctx.status === 404) {
      const currentEnv = app.config.env;
      let msg;
      switch (currentEnv) {
      	case 'local':
          try {
            let filePath = ctx.request.path;
            let pathArr = filePath.split('/')
            filePath = pathArr[pathArr.length - 1]
            // Object(it's Buffer actually) or String encoded by 'utf-8'
            let fileData = await app.memoryFileWorker.requestClientFile(filePath);
            // set mimeType
            console.log(mime.getType(filePath))
            ctx.response.type = mime.getType(filePath);
            // not txt then transfer to Buffer and mimeType will be set to aplication/octet-stream
            if (!isTextPath(filePath)) {
              fileData = Buffer.from(fileData);
            }
            msg = fileData;
          } catch(err) {
            msg = err;
          }
      		break;
      	default:
      		msg = 'sorry, resource not found...';
      		break;
      }
      ctx.body = msg;
    }
  };
};