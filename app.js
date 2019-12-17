const MemoryFileWorker = require('./lib/memory-file-worker');

module.exports = app => {
	console.log('worker enter')
	const index = app.config.coreMiddleware.length
	app.config.coreMiddleware.splice(index, 0, 'memoryFile')
	app.messenger.on('egg-ready', () => {
		console.log('egg-ready from worker');
		if (app.config.env === 'local') {
			app.memoryFileWorker = new MemoryFileWorker(app);
		}
	})
}