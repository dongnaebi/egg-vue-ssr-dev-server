'use strict';
const path = require('path');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
// todo 从配置里拿
const webpackServerConfig = require('../../../app/build/webpack.server.config.js');
const webpackClientConfig = require('../../../app/build/webpack.client.config.js');
const isTextPath = require('is-text-path')

class MemoryFileAgent {
	constructor(agent) {
		this.agent = agent;
		// server compile 'vue-ssr-server-bundle.json'
		const serverCompiler = webpack(webpackServerConfig);
		const serverDev = devMiddleware(serverCompiler, {
			publicPath: webpackServerConfig.output.publicPath,
			writeToDisk: true
		});

		// client compile 'vue-ssr-client-manifest.json'
		const clientCompiler = webpack(webpackClientConfig);
		const clientDev = devMiddleware(clientCompiler, {
			publicPath: webpackClientConfig.output.publicPath,
			writeToDisk: false
		});

		// request memory file from clientDev.fileSystem
		this.agent.messenger.on('request-file', filePath => {
			this.agent.logger.info('request memory file: ' + filePath);
			// check if file exists in webpack memory
			// filePath: relative path like '/index.html'
			// absPath: absolute path for 'memory-fs' usage
			const dev = clientDev;
			dev.waitUntilValid(() => {
				let fileData;
				const fs = dev.fileSystem;
				const absPath = path.join(dev.context.compiler.outputPath, filePath);
				if (fs.existsSync(absPath)) {
					let encoding;
					// Buffer(default) or String(txt extension)
					if (isTextPath(filePath)) {
						encoding = 'utf-8';
					}
					fileData = fs.readFileSync(absPath, encoding);
				}
				agent.messenger.sendToApp(
					fileData ? 'file-found' : 'file-not-found', 
					{ filePath, fileData }
				);
			})
		});
	}
}

module.exports = MemoryFileAgent;
