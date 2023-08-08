import * as dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Partials,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";

dotenv.config();

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
}); // Discord Object

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`); // Logging
  const registerObject = {
    timestamp: {
      name: "timestamp",
      description:
        "Generate Discord timestamps based on a given time and timezone",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "day",
          description: "Day (1 - 31)",
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "month",
          description: "Month (1 - 12)",
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "year",
          description: "Year (min. 1970)",
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "hour",
          description: "Hour (0 - 23)",
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "minute",
          description: "Minute (0 - 59)",
          required: true,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "timezone",
          description: "Timezone (Format: continent/city)",
          required: true,
          type: ApplicationCommandOptionType.String,
          autocomplete: true,
        },
        {
          name: "second",
          description: "Second (0 - 59)",
          required: false,
          type: ApplicationCommandOptionType.Integer,
        },
        {
          name: "prefer_usability",
          description: '"preview: code" (true); "code: preview" (false)',
          required: false,
          type: ApplicationCommandOptionType.Boolean,
        },
        {
          name: "public",
          description:
            "Should the response be visible to everyone? (Default: False)",
          required: false,
          type: ApplicationCommandOptionType.Boolean,
        },
      ],
    },
    currenttimestamp: {
      name: "currenttimestamp",
      description: "Generate Discord timestamps based on the current time",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: "prefer_usability",
          description: '"preview: code" (true); "code: preview" (false)',
          required: false,
          type: ApplicationCommandOptionType.Boolean,
        },
        {
          name: "public",
          description:
            "Should the response be visible to everyone? (Default: False)",
          required: false,
          type: ApplicationCommandOptionType.Boolean,
        },
      ],
    },
  };
  let promises = [];
  promises.push(
    client.application?.commands?.create(registerObject["timestamp"]),
  );
  promises.push(
    client.application?.commands?.create(registerObject["currenttimestamp"]),
  );
  Promise.all(promises).then((reolvedPromises) => {
    process.kill(process.pid, "SIGTERM");
  });
});

client.login(process.env["TOKEN"]);
