const ms = require("ms");
const Discord = require('discord.js');
const Duration = require('humanize-duration');
const { Util, CustomError } = require("../../util/util");
const CooldownManager = require('../classes/Base/CooldownManager');

/**
 * @param {Discord.ButtonInteraction} interaction 
 * @param {Discord.Client} client 
 */
async function ButtonHandler(interaction, client) {

    const { noneEmptyStringArray } = Util;
    const cooldown = new CooldownManager({ user: interaction.user, guild: interaction.guild });

    const button = client.button.get(interaction.customId);
    const authorAvatar = interaction.user.displayAvatarURL({ dynamic: true });

    if (!button) return

    if (!interaction.inGuild()) {

        if (button.data.dm) {

            if (noneEmptyStringArray(button.authorization.users)) {

                for (const whitelist of button.authorization.users) {
                    if (whitelist !== interaction.user.id) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Authorization Required" })
                            .setDescription(Discord.codeBlock(button.authorization.usersError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true });
                    }
                }

            }

            try {
                button.execute(interaction, client);
            } catch {

            }
        }

        return
    }

    if (button.authorization.status) {

        if (noneEmptyStringArray(button.authorization.users)) {

            for (const whitelist of button.authorization.users) {
                if (whitelist !== interaction.user.id) {
                    const AuthorizationEmbed = new Discord.EmbedBuilder()
                        .setColor('#CC3300')
                        .setAuthor({ name: "Authorization Required" })
                        .setDescription(Discord.codeBlock(button.authorization.usersError))
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                    return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true });
                }
            }

        }

        if (interaction.inGuild()) {

            if (noneEmptyStringArray(button.authorization.permissions)) {

                for (const permission of button.authorization.permissions) {
                    if (!interaction.member.permissions.has(permission)) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Authorization Required" })
                            .setDescription(Discord.codeBlock(button.authorization.permissionsError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed] });
                    }
                }

            }

            if (noneEmptyStringArray(button.authorization.roles)) {

                for (const requiredRole of button.authorization.roles) {
                    const a = interaction.guild.roles.cache.find(role => role.id === requiredRole)
                        , b = interaction.guild.roles.cache.find(role => role.name === requiredRole);
                    const role = a || b;
                    if (!role || !interaction.member.roles.cache.has(role.id)) {
                        const RoleEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: 'Missing Roles' })
                            .setDescription(Discord.codeBlock(button.authorization.rolesError))
                            .setFields([
                                {
                                    name: "Required Roles",
                                    value: role.toString()
                                }
                            ])
                            .setTimestamp(Date.now())
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [RoleEmbed], ephemeral: true });
                    }
                }
            }

            if (noneEmptyStringArray(button.authorization.banned)) {

                for (const banned of button.authorization.banned) {
                    if (banned === interaction.user.id) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Banned Notice" })
                            .setDescription(Discord.codeBlock(button.authorization.bannedError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true });
                    }
                }
            }
        }
    }
    
    try {

        // TODO: This is the code where the cooldown was check
        if (button.cooldown.status) {

            const data = await cooldown.checkComponentCooldown(button.data.name, button.cooldown);

            if (data.active) {
                const CooldownEmbed = new Discord.EmbedBuilder()
                    .setColor('Blurple')
                    .setAuthor({ name: 'Button Cooldown' })
                    .setDescription(`This button still on a cooldown.\nTime Remaining: **${data.remaining}**`)
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })

                return interaction.reply({ embeds: [CooldownEmbed], ephemeral: true });
            }

        };

        await button.execute(interaction, client).catch(error => { throw error });

    } catch (error) {

        if (error instanceof Error) {

            console.log(error)
            const ErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#CC3300')
                .setAuthor({ name: "An Error Occured" })
                .setDescription("Failed to process your request")
                .setTimestamp(Date.now())
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            interaction.reply({ embeds: [ErrorEmbed] }).catch(() => {})

        } else if (error instanceof CustomError) {

            const CustomErrorEmbed = new Discord.EmbedBuilder()
                .setColor("#CC3300")
                .setAuthor({ name: "An Error Occured" })
                .setDescription(error.message)
                .setTimestamp(Date.now())
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            return interaction.reply({ embeds: [CustomErrorEmbed], ephemeral: true }).catch(() => {})

        } else if (error instanceof Discord.DiscordAPIError) {

            const CustomErrorEmbed = new Discord.EmbedBuilder()
                .setColor("#CC3300")
                .setAuthor({ name: "An Error Occured" })
                .setDescription('Unable to process your request')
                .setTimestamp(Date.now())
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            return interaction.reply({ embeds: [CustomErrorEmbed], ephemeral: true }).catch(() => {})

        }

    };

};

/**
 * Handle all select menu request
 * @param {Discord.SelectMenuInteraction} interaction 
 * @param {Discord.Client} client 
 * @returns 
 */
async function SelectMenuHandler(interaction, client) {

    const choose = []
    const { noneEmptyStringArray, updateComponent } = Util;
    const authorAvatar = interaction.user.displayAvatarURL({ dynamic: true });
    const cooldown = new CooldownManager({ user: interaction.user, guild: interaction.guild });

    const a = interaction.message.components[0]?.components.filter(component => component.data.type === 3) || []
    ,     b = interaction.message.components[1]?.components.filter(component => component.data.type === 3) || []
    ,     c = interaction.message.components[2]?.components.filter(component => component.data.type === 3) || []
    ,     d = interaction.message.components[3]?.components.filter(component => component.data.type === 3) || []
    ,     e = interaction.message.components[4]?.components.filter(component => component.data.type === 3) || []
    const menu = [...a, ...b, ...c, ...d, ...e]

    const merged = menu.map(menu => menu.data.options.map(option => option.value))
    const values = [].concat.apply([], merged);

    for (let i = 0; i < interaction.values.length; i++) {
        const test = values.filter(data => data === interaction.values[i]);
        choose.push(...test);
    }

    for (const name of choose) {

        const userId = interaction.user.id
        const guildId = interaction.guild.id
        const select = client.select.get(name);
        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!select) return

        if (select.authorization.status) {
            if (noneEmptyStringArray(select.authorization.users)) {

                for (const whitelist of select.authorization.users) {
                    if (whitelist !== interaction.user.id) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Authorization Required" })
                            .setDescription(Discord.codeBlock(select.authorization.usersError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true })
                            .catch(error => interaction.followUp({ embeds: [AuthorizationEmbed] }))
                            , updateComponent(interaction);
                    }
                }

            }

            if (interaction.member) {

                if (noneEmptyStringArray(select.authorization.permissions)) {

                    for (const permission of select.authorization.permissions) {
                        if (!member.permissions.has(permission)) {
                            const AuthorizationEmbed = new Discord.EmbedBuilder()
                                .setColor('#CC3300')
                                .setAuthor({ name: "Authorization Required" })
                                .setDescription(Discord.codeBlock(select.authorization.permissionsError))
                                .setTimestamp()
                                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                            return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true })
                                .catch(error => interaction.followUp({ embeds: [AuthorizationEmbed] }))
                                , updateComponent(interaction);
                        }
                    }

                }

                if (noneEmptyStringArray(select.authorization.roles)) {

                    for (const requiredRole of select.authorization.roles) {
                        const a = interaction.guild.roles.cache.find(role => role.id === requiredRole)
                            , b = interaction.guild.roles.cache.find(role => role.name === requiredRole);
                        const role = a || b;
                        if (!role || !member.roles.cache.has(role.id)) {
                            const RoleEmbed = new Discord.EmbedBuilder()
                                .setColor("Red")
                                .setAuthor({ name: 'Missing Roles' })
                                .setDescription(Discord.codeBlock(select.authorization.rolesError))
                                .setFields([
                                    {
                                        name: "Required Roles",
                                        value: role.toString()
                                    }
                                ])
                                .setTimestamp(Date.now())
                                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                            return interaction.reply({ embeds: [RoleEmbed], ephemeral: true })
                                .catch(error => interaction.followUp({ embeds: [RoleEmbed] }))
                                ,updateComponent(interaction);
                        }
                    }
                }

                if (noneEmptyStringArray(select.authorization.banned)) {

                    for (const banned of select.authorization.banned) {
                        if (banned === interaction.user.id) {
                            const AuthorizationEmbed = new Discord.EmbedBuilder()
                                .setColor('#CC3300')
                                .setAuthor({ name: "Banned Notice" })
                                .setDescription(Discord.codeBlock(select.authorization.bannedError))
                                .setTimestamp()
                                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                            return interaction.reply({ embeds: [AuthorizationEmbed], ephemeral: true })
                                .catch(error => interaction.followUp({ embeds: [AuthorizationEmbed] }))
                                , updateComponent(interaction);
                        }
                    }
                }
            }
        }

        try {

            if (select.cooldown.status) {

                const data = await cooldown.checkComponentCooldown(name, select.cooldown);

                if (data.active) {
                    const CooldownEmbed = new Discord.EmbedBuilder()
                        .setColor('Aqua')
                        .setAuthor({ name: `${capitalizeFirstLetter(name)} Command` })
                        .setDescription(`This selection still on a cooldown.\nTime Remaining: **${data.remaining}**`)
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() }).setTimestamp()
                    return message.channel.send({ embeds: [CooldownEmbed] }).then(message => deleteMessage(message, 20));
                }

            };

            await select.execute(interaction, client).catch(error => { throw error });

        } catch (error) {

            if (error instanceof Error) {

                console.log(error);
                const ErrorEmbed = new Discord.EmbedBuilder()
                    .setColor('#CC3300')
                    .setAuthor({ name: "An Error Occured" })
                    .setDescription("Failed to process your request")
                    .setTimestamp(Date.now())
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                interaction.reply({ embeds: [ErrorEmbed] });

            } else if (error instanceof CustomError) {

                console.log(error);
                const CustomErrorEmbed = new Discord.EmbedBuilder()
                    .setColor("#CC3300")
                    .setAuthor({ name: "An Error Occured" })
                    .setDescription(error.message)
                    .setTimestamp(Date.now())
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                return interaction.reply({ embeds: [CustomErrorEmbed], ephemeral: true });
            } else {

                await error;
                console.log(error);

            }

        }

    };
    
};

/**
 * Handle all request from Modal interaction
 * @param {Discord.ModalSubmitInteraction} interaction 
 * @param {Discord.Client} client 
 */
async function ModalHandler(interaction, client) {

    const name = interaction.customId
    const userId = interaction.user.id
    const guildId = interaction.guild.id
    const modal = client.modal.get(name);
    const { noneEmptyStringArray } = Util;
    const authorAvatar = interaction.user.displayAvatarURL();
    const text = interaction.fields.fields.map(data => data);
    const cooldown = new CooldownManager({ user: interaction.user, guild: interaction.guild });

    if (!modal) return

    if (modal.authorization.status) {
        if (noneEmptyStringArray(modal.authorization.users)) {

            for (const whitelist of modal.authorization.users) {
                if (whitelist !== interaction.user.id) {
                    const AuthorizationEmbed = new Discord.EmbedBuilder()
                        .setColor('#CC3300')
                        .setAuthor({ name: "Authorization Required" })
                        .setDescription(Discord.codeBlock(modal.authorization.usersError))
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                    return interaction.reply({ embeds: [AuthorizationEmbed] });
                }
            }

        }

        if (interaction.guild) {

            if (noneEmptyStringArray(modal.authorization.permissions)) {

                for (const permission of modal.authorization.permissions) {
                    if (!interaction.member.permissions.has(permission)) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Authorization Required" })
                            .setDescription(Discord.codeBlock(modal.authorization.permissionsError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed] });
                    }
                }

            }

            if (noneEmptyStringArray(modal.authorization.roles)) {

                for (const requiredRole of modal.authorization.roles) {
                    const a = interaction.guild.roles.cache.find(role => role.id === requiredRole)
                        , b = interaction.guild.roles.cache.find(role => role.name === requiredRole);
                    const role = a || b;
                    if (!role || !interaction.member.roles.cache.has(role.id)) {
                        const RoleEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: 'Missing Roles' })
                            .setDescription(Discord.codeBlock(modal.authorization.rolesError))
                            .setFields([
                                {
                                    name: "Required Roles",
                                    value: role ? role.toString() : "Role Missing"
                                }
                            ])
                            .setTimestamp(Date.now())
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [RoleEmbed] });
                    }
                }
            }

            if (noneEmptyStringArray(modal.authorization.banned)) {

                for (const banned of modal.authorization.banned) {
                    if (banned === interaction.user.id) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Banned Notice" })
                            .setDescription(Discord.codeBlock(modal.authorization.bannedError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed] });
                    }
                }
            }
        }
    }

    try {

        await modal.execute(interaction, text, client).catch(error => { console.log(error) });

    } catch (error) {

        console.log(error)

        const ErrorEmbed = new Discord.EmbedBuilder()
            .setColor('#CC3300')
            .setAuthor({ name: "An Error Occured" })
            .setDescription("Your request could not be process.")
            .setTimestamp(Date.now())
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        interaction.reply({ embeds: [ErrorEmbed], ephemeral: true }).catch(error => { interaction.followUp({ embeds: [ErrorEmbed] }) });

    };

   
}

module.exports = {
    ModalHandler,
    ButtonHandler,
    SelectMenuHandler
}

async function executeButton(button, interaction, client) {
    await button.execute(interaction, client).catch(error => { throw error });
}