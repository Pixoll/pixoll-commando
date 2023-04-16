import CommandoMessage from '../extensions/message';
import FriendlyError from './friendly';

/** Has a descriptive message for a command not having proper format */
export default class CommandFormatError extends FriendlyError {
    /**
     * @param message - The command message the error is for
     */
    public constructor(message: CommandoMessage) {
        const { guild, command } = message;
        const val = guild ? undefined : null;
        if (!command) throw new TypeError('Command cannot be null or undefined.');
        super(
            `Invalid command usage. The \`${command.name}\` command's accepted format is: ${message.usage(
                command.format ?? undefined, val, val
            )}. Use ${message.anyUsage(
                `help ${command.name}`, val, val
            )} for more information.`
        );
        this.name = 'CommandFormatError';
    }
}
