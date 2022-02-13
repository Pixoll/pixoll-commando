const FriendlyError = require('./friendly');

/**
 * Has a descriptive message for a command not having proper format
 * @extends {FriendlyError}
 */
class CommandFormatError extends FriendlyError {
	/**
	 * @param {CommandoMessage} msg - The command message the error is for
	 */
	constructor(msg) {
		const { guild, command } = msg;
		const val = guild ? undefined : null;
		super(
			`Invalid command usage. The \`${command.name}\` command's accepted format is: ${msg.usage(
				command.format, val, val
			)}. Use ${msg.anyUsage(
				`help ${command.name}`, val, val
			)} for more information.`
		);
		this.name = 'CommandFormatError';
	}
}

module.exports = CommandFormatError;
