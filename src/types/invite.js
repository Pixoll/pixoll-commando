const ArgumentType = require('./base');

class InviteArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'invite');

		/**
		 * The fetched invite
		 * @type {Invite}
		 */
		this.fetched = null;
	}

	async validate(val) {
		const invite = await this.client.fetchInvite(val).catch(() => null);
		this.fetched = invite;
		return !!invite;
	}

	async parse(val) {
		if (this.fetched) {
			const { fetched } = this;
			this.fetched = null;
			return fetched;
		}
		return await this.client.fetchInvite(val);
	}
}

module.exports = InviteArgumentType;
