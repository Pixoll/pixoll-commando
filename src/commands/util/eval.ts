import { inspect } from 'util';
import { stripIndents } from 'common-tags';
import Util from '../../util';
import Command, { CommandContext } from '../base';
import CommandoClient from '../../client';
import { ParseRawArguments } from '../collector';

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

const args = [{
    key: 'script',
    prompt: 'What code would you like to evaluate?',
    type: 'string',
}] as const;

type RawArgs = typeof args;
type ParsedArgs = ParseRawArguments<RawArgs>;

export default class EvalCommand extends Command<boolean, RawArgs> {
    protected lastResult: unknown;
    declare protected _sensitivePattern: RegExp | null;

    public constructor(client: CommandoClient) {
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

    public async run(context: CommandContext, { script }: ParsedArgs): Promise<void> {
        // Remove any surrounding code blocks before evaluation
        if (script.startsWith('```') && script.endsWith('```')) {
            script = script.replace(/(^.*?\s)|(\n.*$)/g, '');
        }

        // Run the code and measure its execution time
        let hrDiff: [number, number];
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(script);
            hrDiff = process.hrtime(hrStart);
        } catch (error) {
            await context.reply(`Error while evaluating: \`${error}\``);
            return;
        }

        // Prepare for callback time and respond
        const result = this.makeResultMessages(this.lastResult, hrDiff, script);
        if (Array.isArray(result)) {
            result.map(item => context.reply(item));
            return;
        } else {
            context.reply(result);
            return;
        }
    }

    protected makeResultMessages(result: unknown, hrDiff: [number, number], input: string | null = null): string[] {
        const inspected = inspect(result, { depth: 0 })
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
        return Util.splitMessage(stripIndents`
        ${input ? 'Executed in' : 'Callback executed after'} ${duration}.*
        \`\`\`javascript
        ${inspected}
        \`\`\`
        `, { maxLength: 1900, prepend, append });
    }

    protected get sensitivePattern(): RegExp {
        let sensitivePattern = this._sensitivePattern;
        if (!sensitivePattern) {
            const client = this.client;
            let pattern = '';
            if (client.token) pattern += Util.escapeRegex(client.token);
            sensitivePattern = new RegExp(pattern, 'gi');
            Object.defineProperty(this, '_sensitivePattern', {
                value: sensitivePattern,
                configurable: false,
            });
        }
        return sensitivePattern;
    }
}
