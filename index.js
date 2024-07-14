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
      case "temperature":
        await interaction.deferReply({ ephemeral });
        let response = "N/A";
        let source = interaction.options.getString("source");
        let target = interaction.options.getString("target");
        let value = interaction.options.getNumber("value");
        switch (source) {
          case "c":
            switch (target) {
              case "c":
                response = `${value} °C = ${value} °C`;
                break;
              case "f":
                response = `${value} °C = ${(9.0 / 5.0) * value + 32.0} °F`;
                break;
              case "k":
                response = `${value} °C = ${value + 273.15} K`;
                break;
              case "r":
                response = `${value} °C = ${value * (9.0 / 5.0) + 491.67} °R`;
                break;
              case "é":
              case "e":
                response = `${value} °C = ${(value * 4.0) / 5.0} °Ré`;
                break;
              default:
                response = `Please specify a temperature unit to convert to`;
                break;
            }
            break;
          case "f":
            switch (target) {
              case "c":
                response = `${value} °F = ${(value - 32.0) / (9.0 / 5.0)} °C`;
                break;
              case "f":
                response = `${value} °F = ${value} °F`;
                break;
              case "k":
                response = `${value} °F = ${((value + 459.67) * 5.0) / 9.0} K`;
                break;
              case "r":
                response = `${value} °F = ${value + 459.67} °R`;
                break;
              case "é":
              case "e":
                response = `${value} °F = ${((value - 32.0) * 4.0) / 9.0} °Ré`;
                break;
              default:
                response = `Please specify a temperature unit to convert to`;
                break;
            }
            break;
          case "k":
            switch (target) {
              case "c":
                response = `${value} K = ${value - 273.15} °C`;
                break;
              case "f":
                response = `${value} K = ${(value * 9.0) / 5.0 - 459.67} °F`;
                break;
              case "k":
                response = `${value} K = ${value} K`;
                break;
              case "r":
                response = `${value} K = ${(value * 9.0) / 5.0} °R`;
                break;
              case "é":
              case "e":
                response = `${value} °C = ${((value - 273.15) * 4.0) / 5.0} °Ré`;
                break;
              default:
                response = `Please specify a temperature unit to convert to`;
                break;
            }
            break;
          case "r":
            switch (target) {
              case "c":
                response = `${value} °R = ${((value - 491.67) * 5.0) / 9.0} °C`;
                break;
              case "f":
                response = `${value} °R = ${value - 459.67} °F`;
                break;
              case "k":
                response = `${value} °R = ${(value * 5.0) / 9.0} K`;
                break;
              case "r":
                response = `${value} °R = ${value} °R`;
                break;
              case "é":
              case "e":
                response = `${value} °R = ${((value - 491.67) * 4.0) / 9.0} °Ré`;
                break;
              default:
                response = `Please specify a temperature unit to convert to`;
                break;
            }
            break;
          case "é":
          case "e":
            switch (target) {
              case "c":
                response = `${value} °Ré = ${(value * 5.0) / 4.0} °C`;
                break;
              case "f":
                response = `${value} °Ré = ${(value * 9.0) / 4.0 + 32.0} °F`;
                break;
              case "k":
                response = `${value} °Ré = ${(value * 5.0) / 4.0 + 273.15} K`;
                break;
              case "r":
                response = `${value} °Ré = ${(value * 9.0) / 4.0 + 491.67} °R`;
                break;
              case "é":
              case "e":
                response = `${value} °Ré = ${value} °Ré`;
                break;
              default:
                response = `Please specify a temperature unit to convert to`;
                break;
            }
            break;
          default:
            response = `Please specify a temperature unit to convert from`;
            break;
        }
        await interaction.editReply({
          content: response,
        });
        console.log(`[temperature] ${response} (Ephemeral: ${ephemeral})`);
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
