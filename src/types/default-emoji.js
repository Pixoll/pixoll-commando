const ArgumentType = require('./base');
const emojiRegex = require('emoji-regex')();

class DefaultEmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'default-emoji');
		this.emojiRegex = new RegExp(`^(?:${emojiRegex.source})$`);
	}

	validate(value, msg, arg) {
		if (!this.emojiRegex.test(value)) return false;
		if (arg.oneOf && !arg.oneOf.includes(value)) {
			return `Please enter one of the following options: ${arg.oneOf.join(' | ')}`;
		}
		return true;
	}

	parse(value) {
		return value;
	}
}

module.exports = DefaultEmojiArgumentType;
