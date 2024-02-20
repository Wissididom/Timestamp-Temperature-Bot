import "dotenv/config";
import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { DateTime } from "luxon";

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

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`); // Logging
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isCommand()) {
    let preferUsability =
      interaction.options.getBoolean("prefer_usability") ?? false;
    let ephemeral = !interaction.options.getBoolean("public");
    let unix = 0;
    let { day, month, year, hour, minute, second, timezone, src, dst } = [
      1,
      1,
      1,
      1,
      1,
      1,
      "",
      "",
      "",
    ];
    switch (interaction.commandName) {
      case "timestamp":
        await interaction.deferReply({ ephemeral });
        day = interaction.options.getInteger("day") ?? 1;
        month = interaction.options.getInteger("month") ?? 1;
        year = interaction.options.getInteger("year") ?? 1970;
        hour = interaction.options.getInteger("hour") ?? 0;
        minute = interaction.options.getInteger("minute") ?? 0;
        second = interaction.options.getInteger("second") ?? 0;
        timezone = interaction.options.getString("timezone");
        //Intl.DateTimeFormat().resolvedOptions().timeZone // own timezone
        unix = DateTime.fromObject(
          {
            day,
            month,
            year,
            hour,
            minute,
            second,
          },
          { zone: timezone },
        ).toUnixInteger();
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
      case "converttime":
        await interaction.deferReply({ ephemeral });
        day = interaction.options.getInteger("day") ?? 1;
        month = interaction.options.getInteger("month") ?? 1;
        year = interaction.options.getInteger("year") ?? 1;
        hour = interaction.options.getInteger("hour") ?? 1;
        minute = interaction.options.getInteger("minute") ?? 1;
        second = interaction.options.getInteger("second") ?? 1;
        src = interaction.options.getString("src");
        dst = interaction.options.getString("dst");
        let srcTimeObj = DateTime.fromObject(
          {
            day,
            month,
            year,
            hour,
            minute,
            second,
          },
          { zone: src },
        );
        let srcTime = srcTimeObj.toLocaleString(
          DateTime.DATETIME_HUGE_WITH_SECONDS,
          { locale: "en-US" },
        );
        let dstTime = srcTimeObj
          .setZone(dst)
          .toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS, {
            locale: "en-US",
          });
        await interaction.editReply({
          content: `\`${srcTime}\` (Timezone: \`${src}\`) in \`${dst}\` is \`${dstTime}\``,
        });
        console.log(
          `[converttime] Day: ${day}; Month: ${month}; Year: ${year}; Hour: ${hour}; Minute: ${minute}; Second: ${second}; Source: ${src}; Destination: ${dst}; Ephemeral: ${ephemeral}`,
        );
        break;
      case "convertcurrenttime":
        await interaction.deferReply({ ephemeral });
        timezone = interaction.options.getString("timezone");
        let currenttime = DateTime.now()
          .setZone(timezone)
          .toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS, {
            locale: "en-US",
          });
        await interaction.editReply({
          content: `The current time in \`${interaction.options.getString(
            "timezone",
          )}\` is \`${currenttime}\``,
        });
        console.log(
          `[convertcurrenttime] Executed /convertcurrenttime (Ephemeral: ${ephemeral})`,
        );
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
