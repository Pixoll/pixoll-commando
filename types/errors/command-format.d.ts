import CommandoMessage from '../extensions/message';
import FriendlyError from './friendly';
/** Has a descriptive message for a command not having proper format */
export default class CommandFormatError extends FriendlyError {
    /**
     * @param message - The command message the error is for
     */
    constructor(message: CommandoMessage);
}
