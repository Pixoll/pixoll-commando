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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy91dGlsL2V2YWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkNBQTJDO0FBQzNDLHNEQUE4QjtBQUM5QixtREFBa0Q7QUFLbEQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO0FBQ3BCLE1BQU0sU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsdUNBQXVDO1FBQy9DLElBQUksRUFBRSxRQUFRO0tBQ2pCLENBQW9ELENBQUM7QUFLdEQsTUFBcUIsV0FBWSxTQUFRLGNBQXlCO0lBQ3BELFVBQVUsQ0FBVTtJQUc5QixZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLE1BQU07WUFDWixLQUFLLEVBQUUsTUFBTTtZQUNiLFdBQVcsRUFBRSwyQkFBMkI7WUFDeEMsbUJBQW1CLEVBQUUsNkNBQTZDO1lBQ2xFLFNBQVMsRUFBRSxJQUFJO1lBQ2YsSUFBSTtTQUNQLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUF1QixFQUFFLEVBQUUsTUFBTSxFQUFjO1FBQzVELHVEQUF1RDtRQUN2RCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwRCxNQUFNLEdB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