# egg-vue-ssr-dev-server
[![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/egg-vue-ssr-dev-server.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/egg-vue-ssr-dev-server

## Demo
https://github.com/dongnaebi/egg-vue-ssr-demo

## Install
```bash
npm i egg-vue-ssr-dev-server -D
```
## Configuration
Change ${app_root}/config/plugin.js to enable egg-vue-ssr-dev-server plugin:
```javascript
// config/plugin.js
exports.vueSsrDevServer = {
  enable: true,
  package: 'egg-vue-ssr-dev-server'
}
```

Configure build information and proxy in ${app_root}/config/config.local.js, it's important, you must be use it in local environment

#### simple configure:
```javascript
// config/config.local.js
config.vueSsrDevServer = {
  // server webpack config file
  serverConfig: path.join(appInfo.baseDir, 'build/webpack.server.config.js'),
  // client webpack config file
  clientConfig: path.join(appInfo.baseDir, 'build/webpack.client.config.js'),
  // webpack public path, make sure it same as your webpackConfig.output.publicPath
  publicPath: '/public/dist/',
  // dev api proxy, just use it like webpack-dev-server's proxy
  proxy: {
    '/api': {
      target: 'https://eggjs.org/',
      changeOrigin: true
    },
    '/api2': {
      target: 'https://github.com/',
      changeOrigin: true
    }
  }
}
```

## Usage

you can see full demo in https://github.com/dongnaebi/egg-vue-ssr-demo

### 1. Move your `src` and `build` dir into ${app_root}, `index.html` into ${app_root}/app
```bash
egg-project
├── package.json
├── app
|   ├── router.js
│   ├── controller
│   |   └── ssr.js
│   ├── public (可选)
│   |   └── dist
│   ├── index.html
├── build // webpack config files
|   ├── webpack.base.config.js
|   ├── webpack.client.config.js
│   ├── webpack.server.config.js
├── config
|   ├── plugin.js
|   ├── config.default.js
│   ├── config.prod.js
|   ├── config.local.js
└── src // your vue project
|   ├── entry-client.js
|   ├── entry-server.js
│   ├── App.vue
|   ├── app.js
|   ├── ...
```

index.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```
### 2. Create ssr.js in your controller
```javascript
// app/controller/ssr.js
'use strict'

const fs = require('fs')
const path = require('path')
const { Controller } = require('egg')
const { createBundleRenderer } = require('vue-server-renderer')

let serverBundle
let template
let clientManifest

class SsrController extends Controller {
  async index () {
    const { ctx, app } = this
    if (!template) template = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')

    if (app.config.env === 'local') {
      const serverBundleString = await app.memoryFileWorker.requestServerFile('vue-ssr-server-bundle.json')
      const clientBundleString = await app.memoryFileWorker.requestClientFile('vue-ssr-client-manifest.json')
      serverBundle = JSON.parse(serverBundleString)
      clientManifest = JSON.parse(clientBundleString)
    } else {
      if (!serverBundle) serverBundle = path.resolve(__dirname, '../public/dist/vue-ssr-server-bundle.json')
      if (!clientManifest) clientManifest = require(path.resolve(__dirname, '../public/dist/vue-ssr-client-manifest.json'))
    }

    const renderer = createBundleRenderer(serverBundle, {
      runInNewContext: false,
      template,
      clientManifest,
      shouldPreload: (file, type) => {
        return false
      },
      shouldPrefetch: (file, type) => {
        return false
      }
    })

    // context for SSR
    const ssrContext = {
      url: ctx.url
    }

    let html = ''
    try {
      html = await renderer.renderToString(ssrContext)
    } catch (err) {
      if (err.code === 404) {
        ctx.status = 404
        html = '404 Not Found'
      } else {
        ctx.status = 500
        if (app.config.env === 'local') {
          html = err.stack
        } else {
          html = `500 | SSR Render Error`
        }
        console.error(`error during render : ${ctx.url}`)
        console.error(err.stack)
      }
    }
    ctx.body = html
  }
}

module.exports = SsrController
```

### 3. Add you egg router rule at **last line** (let your other rule can work)
```javascript
// app/router.js
router.get('*', controller.ssr.index)
```

### 4. Run
```bash
npm run dev
# localhost:7001
```

## Questions & Suggestions

Please open an issue [here](https://github.com/dongnaebi/egg-vue-ssr-demo/issues).

## License

[MIT](LICENSE)
