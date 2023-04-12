"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const common_tags_1 = require("common-tags");
const util_2 = __importDefault(require("../../util"));
const base_1 = __importDefault(require("../base"));
const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');
const args = [{
        key: 'script',
        prompt: 'What code would you like to evaluate?',
        type: 'string',
    }];
class EvalCommand extends base_1.default {
    lastResult;
    constructor(client) {
        super(client, {
            name: 'eval',
            group: 'util',
            description: 'Executes JavaScript code.',
            detailedDescription: 'Only the bot owner(s) may use this command.',
            ownerOnly: true,
            args,
        });
        this.lastResult = null;
        Object.defineProperty(this, '_sensitivePattern', { value: null, configurable: true });
    }
    async run(context, { script }) {
        // Remove any surrounding code blocks before evaluation
        if (script.startsWith('```') && script.endsWith('```')) {
            script = script.replace(/(^.*?\s)|(\n.*$)/g, '');
        }
        // Run the code and measure its execution time
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(script);
            hrDiff = process.hrtime(hrStart);
        }
        catch (error) {
            await context.reply(`Error while evaluating: \`${error}\``);
            return;
        }
        // Prepare for callback time and respond
        const result = this.makeResultMessages(this.lastResult, hrDiff, script);
        if (Array.isArray(result)) {
            result.map(item => context.reply(item));
            return;
        }
        else {
            context.reply(result);
            return;
        }
    }
    makeResultMessages(result, hrDiff, input = null) {
        const inspected = (0, util_1.inspect)(result, { depth: 0 })
            .replace(nlPattern, '\n')
            .replace(this.sensitivePattern, '--snip--');
        const split = inspected.split('\n');
        const last = inspected.length - 1;
        const prependPart = (inspected[0] !== '{'
            && inspected[0] !== '['
            && inspected[0] !== '\'')
            ? split[0]
            : inspected[0];
        const appendPart = (inspected[last] !== '}'
            && inspected[last] !== ']'
            && inspected[last] !== '\'')
            ? split[split.length - 1]
            : inspected[last];
        const prepend = `\`\`\`javascript\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;
        const duration = `${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms`;
        return util_2.default.splitMessage((0, common_tags_1.stripIndents) `
        ${input ? 'Executed in' : 'Callback executed after'} ${duration}.*
        \`\`\`javascript
        ${inspected}
        \`\`\`
        `, { maxLength: 1900, prepend, append });
    }
    get sensitivePattern() {
        let sensitivePattern = this._sensitivePattern;
        if (!sensitivePattern) {
            const client = this.client;
            let pattern = '';
            if (client.token)
                pattern += util_2.default.escapeRegex(client.token);
            sensitivePattern = new RegExp(pattern, 'gi');
            Object.defineProperty(this, '_sensitivePattern', {
                value: sensitivePattern,
                configurable: false,
            });
        }
        return sensitivePattern;
    }
}
exports.default = EvalCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsL2V2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkNBQTJDO0FBQzNDLHNEQUE4QjtBQUM5QixtREFBa0Q7QUFJbEQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0FBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsdUNBQXVDO1FBQy9DLElBQUksRUFBRSxRQUFRO0tBQ2pCLENBQVUsQ0FBQztBQUtaLE1BQXFCLFdBQVksU0FBUSxjQUF5QjtJQUNwRCxVQUFVLENBQVU7SUFHOUIsWUFBbUIsTUFBc0I7UUFDckMsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLElBQUksRUFBRSxNQUFNO1lBQ1osS0FBSyxFQUFFLE1BQU07WUFDYixXQUFXLEVBQUUsMkJBQTJCO1lBQ3hDLG1CQUFtQixFQUFFLDZDQUE2QztZQUNsRSxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBdUIsRUFBRSxFQUFFLE1BQU0sRUFBYztRQUM1RCx1REFBdUQ7UUFDdkQsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDcEQsTUFBTSxHQUFH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