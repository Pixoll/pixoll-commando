const ArgumentType = require('./base');

class MessageArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'message');
	}

	async validate(val, msg) {
		if (!/^\d+$/.test(val)) return false;
		const message = await msg.channel.messages.fetch(val).catch(() => null);
		return !!message;
	}

	parse(val, msg) {
		return msg.channel.messages.cache.get(val);
	}
}

module.exports = MessageArgumentType;
