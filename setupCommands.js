import * as dotenv from "dotenv";
dotenv.config();
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env["TOKEN"];
const rest = new REST().setToken(token);

let commands = [
  new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription(
      "Generate Discord timestamps based on a given time and timezone",
    )
    .addIntegerOption((option) =>
      option.setName("day").setDescription("Day (1 - 31)").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("Month (1 - 12)")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("Year (min. 1970)")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("hour").setDescription("Hour (0 - 23)").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minute")
        .setDescription("Minute (0 - 59)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Timezone (Format: continent/city)")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("second")
        .setDescription("Second (0 - 59)")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("prefer_usability")
        .setDescription('"preview: code" (true); "code: preview" (false)')
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription(
          "Should the response be visible to everyone? (Default: False)",
        )
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("currenttimestamp")
    .setDescription("Generate Discord timestamps based on the current time")
    .addBooleanOption((option) =>
      option
        .setName("prefer_usability")
        .setDescription('"preview: code" (true); "code: preview" (false)')
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription(
          "Should the response be visible to everyone? (Default: False)",
        )
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("converttime")
    .setDescription("Convert a date and time between timezones")
    .addIntegerOption((option) =>
      option.setName("day").setDescription("Day (1 - 31)").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("Month (1 - 12)")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("Year (min. 1970)")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option.setName("hour").setDescription("Hour (0 - 23)").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("minute")
        .setDescription("Minute (0 - 59)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("src")
        .setDescription("Source Timezone (Format: continent/city)")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("dst")
        .setDescription("Destination Timezone (Format: continent/city)")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("second")
        .setDescription("Second (0 - 59)")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription(
          "Should the response be visible to everyone? (Default: False)",
        )
        .setRequired(false),
    ),
  new SlashCommandBuilder()
    .setName("convertcurrenttime")
    .setDescription("Convert the current date and time to another timezone")
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Timezone (Format: continent/city)")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("public")
        .setDescription(
          "Should the response be visible to everyone? (Default: False)",
        )
        .setRequired(false),
    ),
];

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );
    const userData = await rest.get(Routes.user());
    const userId = userData.id;
    const data = await rest.put(Routes.applicationCommands(userId), {
      body: commands,
    });
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (err) {
    console.error(err);
  }
})();
