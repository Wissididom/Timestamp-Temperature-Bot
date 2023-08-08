import * as dotenv from "dotenv";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { DateTime } from "luxon";

dotenv.config();

const SUPPORTED_TIMEZONES = Intl.supportedValuesOf("timeZone");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

function getContent(unix, preferUsability = false) {
  if (preferUsability)
    return `
<t:${unix}>: \`<t:${unix}>\`
<t:${unix}:t>: \`<t:${unix}:t>\`
<t:${unix}:T>: \`<t:${unix}:T>\`
<t:${unix}:d>: \`<t:${unix}:d>\`
<t:${unix}:D>: \`<t:${unix}:D>\`
<t:${unix}:f>: \`<t:${unix}:f>\`
<t:${unix}:F>: \`<t:${unix}:F>\`
<t:${unix}:R>: \`<t:${unix}:R>\`
	`;
  else
    return `
\`<t:${unix}>\`: <t:${unix}>
\`<t:${unix}:t>\`: <t:${unix}:t>
\`<t:${unix}:T>\`: <t:${unix}:T>
\`<t:${unix}:d>\`: <t:${unix}:d>
\`<t:${unix}:D>\`: <t:${unix}:D>
\`<t:${unix}:f>\`: <t:${unix}:f>
\`<t:${unix}:F>\`: <t:${unix}:F>
\`<t:${unix}:R>\`: <t:${unix}:R>
	`;
}

function getConsoleContent(
  currenttimestamp,
  ephemeral,
  day,
  month,
  year,
  hour,
  minute,
  second,
  timezone,
) {
  if (currenttimestamp)
    return `[currenttimestamp] Executed /currenttimestamp (Ephemeral: ${ephemeral})`;
  return `[timestamp] Day: ${day}; Month: ${month}; Year: ${year}; Hour: ${hour}; Minute: ${minute}; Second: ${second}; Timezone: ${timezone}; Ephemeral: ${ephemeral}`;
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`); // Logging
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    let preferUsability =
      interaction.options.getBoolean("prefer_usability") ?? false;
    let ephemeral = !interaction.options.getBoolean("public");
    let unix = 0;
    switch (interaction.commandName) {
      case "timestamp":
        await interaction.deferReply({ ephemeral });
        let day = interaction.options.getInteger("day") ?? 1;
        let month = interaction.options.getInteger("month") ?? 1;
        let year = interaction.options.getInteger("year") ?? 1970;
        let hour = interaction.options.getInteger("hour") ?? 0;
        let minute = interaction.options.getInteger("minute") ?? 0;
        let second = interaction.options.getInteger("second") ?? 0;
        let timezone = interaction.options.getString("timezone");
        //Intl.DateTimeFormat().resolvedOptions().timeZone // own timezone
        unix = DateTime.now()
          .setZone(timezone)
          .set({ day, month, year, hour, minute, second })
          .toUnixInteger();
        await interaction.editReply({
          content: getContent(unix, preferUsability),
        });
        console.log(
          getConsoleContent(
            false,
            ephemeral,
            day,
            month,
            year,
            hour,
            minute,
            second,
            timezone,
          ),
        );
        break;
      case "currenttimestamp":
        await interaction.deferReply({ ephemeral });
        unix = DateTime.now().toUnixInteger();
        await interaction.editReply({
          content: getContent(unix, preferUsability),
        });
        console.log(getConsoleContent(true, ephemeral));
        break;
    }
  } else if (interaction.isAutocomplete()) {
    let timezoneResponse = SUPPORTED_TIMEZONES.filter((zone) => {
      return (
        zone
          .toLowerCase()
          .indexOf(
            interaction.options.getFocused().replace(" ", "_").toLowerCase(),
          ) >= 0
      );
    });
    timezoneResponse.length = Math.min(timezoneResponse.length, 25); // send max. 25 choices
    await interaction
      .respond(
        timezoneResponse.map((zone) => {
          return {
            name: zone,
            value: zone,
          };
        }),
      )
      .catch((err) => console.error(JSON.stringify(err)));
  }
});

client.login(process.env["TOKEN"]);
