const MemoryFileAgent = require('./lib/memory-file-agent');

module.exports = agent => {
	console.log('agent enter');
	agent.messenger.on('egg-ready', () => {
		console.log('egg-ready from agent');
		if (agent.config.env === 'local') {
			agent.memoryFileAgent = new MemoryFileAgent(agent);
		}
	});
}