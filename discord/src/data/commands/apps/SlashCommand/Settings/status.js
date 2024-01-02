let counter = 0;
const cache = {}
const status = [];

const Discord = require('discord.js');
const DiscordType = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Util } = require('../../../../../../util/util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Change the bot status")
        .addStringOption((options) => {
            return options
                .setName("content")
                .setDescription("The content to be display on the status")
                .setAutocomplete(true);
        })
        .addBooleanOption((options) => {
            return options.setName("edit").setDescription("Open the status editor");
        })
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    cooldown: {
        time: 0,
        unit: "",
        type: "",
        status: false,
    },
    autocomplete: {
        choices: {
            quotes: [
                "The only limit is the one you set.",
                "Don't count the days; make the days count.",
                "Hardships often prepare ordinary people for an extraordinary destiny.",
                "The best way to predict the future is to create it.",
                "The only way to do great work is to love what you do.",
                "It does not matter how slowly you go as long as you do not stop.",
                "The secret of getting ahead is getting started.",
                "Success is walking from failure to failure with no loss of enthusiasm.",
                "The journey of a thousand miles begins with one step.",
                "It is not in the stars to hold our destiny, but in ourselves.",
                "The only way to do great work is to be passionate about it.",
                "The only limit to our realization of tomorrow will be our doubts of today.",
                "The only way to do great work is to be obsessed with it.",
                "The only way to do great work is to be devoted to it.",
                "The only way to do great work is to be committed to it.",
            ],
        },
        /**
         * @param {Discord.AutocompleteInteraction} interaction
         * @param {Discord.Client} client
         */
        async execute(interaction, client) {
            const focused = interaction.options.getFocused();
            const filtered = Util.sortWords(this.choices.quotes, focused);

            const limit =
                filtered.length > 25 ? filtered.slice(0, 24) : filtered.slice(0, 25);
            const respond = limit.map((choice) => ({ name: choice, value: choice }));
            await interaction.respond(respond);
        },
    },
    authorization: {
        status: true,
        users: [""],
        roles: ["STAFF"],
        banned: [""],
        usersError: "",
        rolesError: "You're not authorize to use this command",
        bannedError: "",
        permissions: "",
        permissionsError: "",
    },
    /**
     *
     * @param {Discord.CommandInteraction} interaction
     * @param {Discord.Client} client
     */
    async execute(interaction, client) {
        const editor = interaction.options.getBoolean("edit");
        const content = interaction.options.getString("content");

        if (editor) {
            const StatusEmbed = new Discord.EmbedBuilder()
                .setColor("Blurple")
                .setAuthor({
                    name: "Status Content",
                    iconURL: client.user.displayAvatarURL(),
                })
                .setDescription("Current status saved content")
                .setFields([
                    {
                        name: "Content",
                        value:
                            status
                                .map((value, index) => `${index + 1} : ${value}\n`)
                                .join("") || "Not Yet Set",
                    },
                ])
                .setFooter({
                    text: "To delete a content from the list, please use the button below",
                });
            const button = new Discord.ButtonBuilder()
                .setCustomId("DELETE_STATUS_CONTENT")
                .setStyle(2)
                .setLabel("Delete Save Content");
            const component = new Discord.ActionRowBuilder().addComponents(button);
            const prompt = await interaction.reply({
                embeds: [StatusEmbed],
                components: [component],
                fetchReply: true,
            });

            prompt
                .awaitMessageComponent({
                    filter: (i) => i.user.id === interaction.user.id,
                    componentType: DiscordType.ComponentType.Button,
                    idle: 60000,
                })
                .then((i) => {
                    if (status.length === 0)
                        return i.reply({
                            content:
                                "There is no content been save yet.\nPlease use the command to save the status content.",
                            ephemeral: true,
                        });

                    const FormattingEmbed = new Discord.EmbedBuilder()
                        .setColor("Aqua")
                        .setAuthor({
                            name: "Delete Content",
                            iconURL: interaction.user.displayAvatarURL(),
                        })
                        .setDescription(
                            "Please send the number of the content into the chat that you want to delete."
                        )
                        .setFields([
                            {
                                name: "Single Delete Formatting",
                                value: Discord.codeBlock("2"),
                                inline: true,
                            },
                            {
                                name: "Batch Delete Formatting",
                                value: Discord.codeBlock("1, 2, 3, 4, ..."),
                                inline: true,
                            },
                        ])
                        .setTimestamp()
                        .setFooter({ text: "Canceled when no inactivity for 60 seconds" });
                    i.reply({ embeds: [FormattingEmbed], ephemeral: true });

                    const filter = (msg) => msg.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({
                        filter,
                        idle: 60000,
                    });

                    collector.on("collect", (message) => {
                        const { content } = message;

                        if (content.includes(",")) {
                            const removeValFromIndex = content
                                .replace(/\s/g, "")
                                .split(",")
                                .map((value) => parseInt(value) - 1);

                            if (removeValFromIndex.includes(NaN))
                                return message.channel.send({
                                    content: "Please only include numbers only",
                                });

                            delete cache[client.user.id];

                            for (let i = removeValFromIndex.length - 1; i >= 0; i--)
                                status.splice(removeValFromIndex[i], 1);

                            const StatusEmbed = new Discord.EmbedBuilder()
                                .setColor("Blurple")
                                .setAuthor({
                                    name: "Status Content",
                                    iconURL: client.user.displayAvatarURL(),
                                })
                                .setFields([
                                    {
                                        name: "Content",
                                        value:
                                            status
                                                .map((value, index) => `${index + 1} : ${value}\n`)
                                                .join("") || "No Content Has Been Saved",
                                    },
                                ])
                                .setFooter({ text: "Status content has been updated" });
                            message.channel.send({ embeds: [StatusEmbed] });
                            collector.stop();
                        } else {
                            if (isNaN(content))
                                return message.channel.send({
                                    content: "Content is not a number",
                                });

                            const value = parseInt(content);

                            if (value > status.length)
                                return message.channel.send({
                                    content: "Please enter a correct number",
                                });

                            delete cache[client.user.id];

                            const slice = value - 1;
                            const index = status.indexOf(status[slice]);
                            if (index > -1) status.splice(index, 1);

                            const StatusEmbed = new Discord.EmbedBuilder()
                                .setColor("Blurple")
                                .setAuthor({
                                    name: "Status Content",
                                    iconURL: client.user.displayAvatarURL(),
                                })
                                .setDescription(
                                    "Current status content that will change interval"
                                )
                                .setFields([
                                    {
                                        name: "Content",
                                        value:
                                            status
                                                .map((value, index) => `${index + 1} : ${value}\n`)
                                                .join("") || "No Content Has Been Saved",
                                    },
                                ])
                                .setFooter({ text: "Status content has been updated" });
                            message.channel.send({ embeds: [StatusEmbed] });
                            collector.stop();
                        }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            const update = () => {
                client.user.setPresence({
                    activities: [
                        {
                            name: status[counter] ? status[counter] : "",
                            type: DiscordType.ActivityType.Streaming,
                            url: "https://www.twitch.tv/mhmi__",
                        },
                    ],
                    status: DiscordType.PresenceUpdateStatus.Idle,
                });

                if (++counter >= status.length) counter = 0;

                cache[client.user.id] = setTimeout(update, 1000 * 60 * 5);
            };

            if (typeof cache[client.user.id] === "undefined") {
                status.push(content);
                update();

                const StatusEmbed = new Discord.EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({
                        name: "Status Content",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setDescription("Status content has been saved")
                    .setFields([
                        {
                            name: "Content",
                            value: status
                                .map((value, index) => `${index + 1} : ${value}\n`)
                                .join(""),
                        },
                    ]);
                interaction.reply({ embeds: [StatusEmbed] });
            } else {
                status.push(content);

                const StatusEmbed = new Discord.EmbedBuilder()
                    .setColor("Blurple")
                    .setAuthor({
                        name: "Status Content",
                        iconURL: client.user.displayAvatarURL(),
                    })
                    .setDescription("Current status content that will change interval")
                    .setFields([
                        {
                            name: "Content",
                            value: status
                                .map((value, index) => `${index + 1} : ${value}\n`)
                                .join(""),
                        },
                    ]);
                interaction.reply({ embeds: [StatusEmbed] });
            }
        }
    },
};