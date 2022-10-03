import * as dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

const mySecret = process.env['TOKEN']; // Discord Token

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages], partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction]}); // Discord Object

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`); // Logging
	const registerObject = {
		timestamp: {
			name: 'timestamp',
			description: 'Generate an Discord timestamp from time and timezone',
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: 'day',
					description: 'Day (1 - 31)',
					required: true,
					type: ApplicationCommandOptionType.Integer
				},
				{
					name: 'month',
					description: 'Month (1 - 12)',
					required: true,
					type: ApplicationCommandOptionType.Integer
				},
				{
					name: 'year',
					description: 'Year (min. 1970)',
					required: true,
					type: ApplicationCommandOptionType.Integer
				},
				{
					name: 'hour',
					description: 'Hour (0 - 23)',
					required: true,
					type: ApplicationCommandOptionType.Integer
				},
				{
					name: 'minute',
					description: 'Minute (0 - 59)',
					required: true,
					type: ApplicationCommandOptionType.Integer
				},
				{
					name: 'timezone',
					description: 'Timezone (Format: continent/city)',
					required: true,
					type: ApplicationCommandOptionType.String,
					autocomplete: true
				},
				{
					name: 'ephemeral',
					description: 'Should the response be only visible to yourself?',
					required: false,
					type: ApplicationCommandOptionType.Boolean
				},
				{
					name: 'second',
					description: 'Second (0 - 59)',
					required: false,
					type: ApplicationCommandOptionType.Integer
				}
			]
		}
	};
	let promises = [];
	promises.push(client.application?.commands?.create(registerObject['timestamp']));
	Promise.all(promises).then(reolvedPromises => {
		process.kill(process.pid, 'SIGTERM');
	});
});

client.login(mySecret);
