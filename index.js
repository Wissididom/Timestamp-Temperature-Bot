import * as dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { DateTime } from 'luxon';

const mySecret = process.env['TOKEN']; // Discord Token

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages], partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction]}); // Discord Object

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`); // Logging
});

client.on("interactionCreate", async interaction => {
	if (interaction.isCommand()) {
		let unix = 0;
		switch (interaction.commandName) {
			case 'timestamp':
				await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? true });
				let day = interaction.options.getInteger('day') ?? 1;
				let month = interaction.options.getInteger('month') ?? 1;
				let year = interaction.options.getInteger('year') ?? 1970;
				let hour = interaction.options.getInteger('hour') ?? 0;
				let minute = interaction.options.getInteger('minute') ?? 0;
				let second = interaction.options.getInteger('second') ?? 0;
				let timezone = interaction.options.getString('timezone');
				//Intl.DateTimeFormat().resolvedOptions().timeZone // own timezone
				unix = DateTime.now().setZone(timezone).set({ day, month, year, hour, minute, second}).toUnixInteger();
				await interaction.editReply({
					content: `<t:${unix}>: \`<t:${unix}>\`\n<t:${unix}:t>: \`<t:${unix}:t>\`\n<t:${unix}:T>: \`<t:${unix}:T>\`\n<t:${unix}:d>: \`<t:${unix}:d>\`\n<t:${unix}:D>: \`<t:${unix}:D>\`\n<t:${unix}:f>: \`<t:${unix}:f>\`\n` +
								`<t:${unix}:F>: \`<t:${unix}:F>\`\n<t:${unix}:R>: \`<t:${unix}:R>\``
				});
				console.log(`[timestamp] Day: ${day}; Month: ${month}; Year: ${year}; Hour: ${hour}; Minute: ${minute}; Second: ${second}; Timezone: ${timezone}; Ephemeral: ${ephemeral}`);
				break;
			case 'currenttimestamp':
				await interaction.deferReply({ ephemeral: interaction.options.getBoolean('ephemeral') ?? true });
				unix = DateTime.now().toUnixInteger();
				await interaction.editReply({
					content: `<t:${unix}>: \`<t:${unix}>\`\n<t:${unix}:t>: \`<t:${unix}:t>\`\n<t:${unix}:T>: \`<t:${unix}:T>\`\n<t:${unix}:d>: \`<t:${unix}:d>\`\n<t:${unix}:D>: \`<t:${unix}:D>\`\n<t:${unix}:f>: \`<t:${unix}:f>\`\n` +
								`<t:${unix}:F>: \`<t:${unix}:F>\`\n<t:${unix}:R>: \`<t:${unix}:R>\``
				});
				console.log(`[currenttimestamp] Day: ${day}; Month: ${month}; Year: ${year}; Hour: ${hour}; Minute: ${minute}; Second: ${second}; Timezone: ${timezone}; Ephemeral: ${ephemeral}`);
				break;
		}
	} else if (interaction.isAutocomplete()) {
		let timezoneResponse = Intl.supportedValuesOf('timeZone').filter(zone => {
			return zone.toLowerCase().indexOf(interaction.options.getFocused().replace(' ', '_').toLowerCase()) >= 0
		});
		timezoneResponse.length = Math.min(timezoneResponse.length, 25); // send max. 25 choices
		await interaction.respond(timezoneResponse.map(zone => {
			return {
				name: zone,
				value: zone
			}
		})).catch(err => console.error(JSON.stringify(err)));
	}
});

client.login(mySecret);
