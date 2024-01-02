const cache = {};
const cooldownCache = {};
const Discord = require('discord.js');
const Matcher = require('did-you-mean');
const { Util, CustomError } = require('../../util/util');
const CooldownManager = require('../classes/Base/CooldownManager');
const GuildSettings = require('../classes/Base/GuildSettingManager');

/**
 * * Message Command Handler
 * * Listen for message that start with prefix and handle the request
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
async function CommandHandler(message, client) {

    // TODO: Assign the prefix to a guild if empty
    const settings = new GuildSettings({ guild: message.guild, client });
    if (cache[message.guild.id] === undefined) await settings.prefix();


    const { guild, member, author } = message
    const cooldown = new CooldownManager({ user: author, guild });
    const { noneEmptyStringArray, deleteMessage, capitalizeFirstLetter } = Util;

    const prefix = settings.cache[message.guild.id].prefix

    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const string = message.content
    const array = string.slice(prefix.length).split(/ +/);

    const arguments = array.filter(function (string) { return /\S/.test(string) });

    const name = arguments.shift()?.toLowerCase();

    const authorAvatar = message.author.avatarURL({ format: "png", size: 1024 });

    const command = client.messages.get(name) || client.messages.find(alias => alias.data.aliases && alias.data.aliases.includes(name));


    if (!command) {
        const matching = client.levenshtein.get("matcher");
        const match = new Matcher(matching);

        if (!name) return;

        const cmd = match.get(name);
        const notFound = "No Match Found"
        const found = `Did you mean ${Discord.inlineCode(`${prefix}${cmd}`)}?`;

        const UnknownCommandEmbed = new Discord.EmbedBuilder()
            .setColor('DarkRed')
            .setAuthor({ name: "Unknown Command" })
            .setDescription(`${cmd ? found : notFound}\n${Discord.inlineCode(message.content)} is not recognize as a command.`)
            .setTimestamp()
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        return message.channel.send({ embeds: [UnknownCommandEmbed] }).then(message => deleteMessage(message));
    }

    // TODO: Authorizing the user
    if (command.authorization.status) {

        if (noneEmptyStringArray(command.authorization.banned)) {
            const banned = command.authorization.banned.find(id => message.author.id === id)

            if (banned) {
                const AuthorizationEmbed = new Discord.EmbedBuilder()
                    .setColor('#CC3300')
                    .setAuthor({ name: "Banned Notice" })
                    .setDescription(Discord.codeBlock(command.authorization.bannedError))
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${message.author.username}`, iconURL: authorAvatar })
                return message.channel.send({ embeds: [AuthorizationEmbed] }).then(message => deleteMessage(message));
            }
        }

        if (noneEmptyStringArray(command.authorization.users)) {
            const whitelist = command.authorization.users.find(id => message.author.id === id);

            if (!whitelist) {
                const AuthorizationEmbed = new Discord.EmbedBuilder()
                    .setColor('#CC3300')
                    .setAuthor({ name: "Authorization Required" })
                    .setDescription(Discord.codeBlock(command.authorization.usersError))
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${message.author.username}`, iconURL: authorAvatar })
                return message.channel.send({ embeds: [AuthorizationEmbed] }).then(message => deleteMessage(message));
            }
        }

        if (noneEmptyStringArray(command.authorization.permissions)) {
            for (const permission of command.authorization.permissions) {
                if (!member.permissions.has(permission)) {
                    const AuthorizationEmbed = new Discord.EmbedBuilder()
                        .setColor('#CC3300')
                        .setAuthor({ name: "Authorization Required" })
                        .setDescription(Discord.codeBlock(command.authorization.permissionsError))
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: authorAvatar })
                    return message.channel.send({ embeds: [AuthorizationEmbed] }).then(message => deleteMessage(message));
                }
            }
        }

        if (noneEmptyStringArray(command.authorization.roles)) {
            for (const requiredRole of command.authorization.roles) {
                const a = guild.roles.cache.find(role => role.id === requiredRole)
                    , b = guild.roles.cache.find(role => role.name === requiredRole);
                const role = a || b;
    
                if (!role || !member.roles.cache.has(role.id)) {
                    const RoleEmbed = new Discord.EmbedBuilder()
                        .setColor('#CC3300')
                        .setAuthor({ name: 'Missing Roles' })
                        .setDescription(Discord.codeBlock(command.authorization.rolesError))
                        .setTimestamp(Date.now())
                        .setFooter({ text: `Requested by ${message.author.username}`, iconURL: authorAvatar })
                    return message.channel.send({ embeds: [RoleEmbed] }).then(message => deleteMessage(message));
                }
            }
        }

    };

    if (arguments.length < command.data.minArgs || command.data.maxArgs !== null && arguments.length > command.data.maxArgs) {
        const ArgsEmbed = new Discord.EmbedBuilder()
            .setColor('#CC3300')
            .setAuthor({ name: 'Incorrect Usage' })
            .setDescription(Discord.codeBlock(`${prefix}${command.data.expectedArgs}`))
            .setTimestamp(Date.now())
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        return message.channel.send({ embeds: [ArgsEmbed] }).then(message => deleteMessage(message));
    }

    // if (command.data.arguments) {


    //     // TODO: Validate Arguments
    //     for (let i = 0; i < command.data.arguments.length; i++) {
    //         const input = arguments[i]
    //         const supplied = await command.data.arguments[i].validation(input, message, client);

    //         if (supplied) return;
    //     }
    // }

    try {

        if (command.cooldown.status) {

            const data = await cooldown.checkCommandCooldown(name, command.cooldown);

            if (data.active) {
                const CooldownEmbed = new Discord.EmbedBuilder()
                    .setColor('Aqua')
                    .setAuthor({ name: `${capitalizeFirstLetter(name)} Command` })
                    .setDescription(`This command still on a cooldown.\nTime Remaining: **${data.remaining}**`)
                    .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setTimestamp()
                return message.channel.send({ embeds: [CooldownEmbed] }).then(message => deleteMessage(message, 20));
            }

        }

        await command.execute(message, arguments, arguments.join(' '), client).catch(error => { console.log(error) });

    } catch (error) {

        if (error instanceof Error) {

            console.log(error);
            const ErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#CC3300')
                .setAuthor({ name: "An Error Occured" })
                .setDescription("Failed to process your request")
                .setTimestamp(Date.now())
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            message.channel.send({ embeds: [ErrorEmbed] });

        } else if (error instanceof CustomError) {

            console.log("Custom Error:".red, error);
            const CustomErrorEmbed = new Discord.EmbedBuilder()
                .setColor("#CC3300")
                .setAuthor({ name: "An Error Occured" })
                .setDescription(error.message)
                .setTimestamp(Date.now())
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            return message.channel.send({ embeds: [CustomErrorEmbed], ephemeral: true });

        } else {

            await error;
            console.log("Unknown Error:".red, error);

        }

    };
}


/**
 * 
 * @param {Discord.CommandInteraction | Discord.ContextMenuCommandInteraction} interaction 
 * @param {Discord.Client} client 
 */
async function ApplicationCommandHandler(interaction, client) {


    const { capitalizeFirstLetter, noneEmptyStringArray } = Util;
    const command = client.commands.get(interaction.commandName);
    const authorAvatar = interaction.user.displayAvatarURL({ dynamic: true });
    const cooldown = new CooldownManager({ user: interaction.user, guild: interaction.guild });

    if (!command)
    return interaction.reply({ content: 'This command is not available', ephemeral: true })

    if (interaction.isAutocomplete())
    return await command.autocomplete.execute(interaction, client).catch(error => { console.log(error) });

    if (command.authorization?.status) {

        if (noneEmptyStringArray(command.authorization.users)) {

            if (!command.authorization.users.includes(interaction.user.id)) {
                const AuthorizationEmbed = new Discord.EmbedBuilder()
                    .setColor('#CC3300')
                    .setAuthor({ name: "Authorization Required" })
                    .setDescription(Discord.codeBlock(command.authorization.usersError))
                    .setTimestamp()
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                return interaction.reply({ embeds: [AuthorizationEmbed] });
            }

        }

        if (interaction.inGuild()) {

            if (noneEmptyStringArray(command.authorization.permissions)) {

                for (const permission of command.authorization.permissions) {
                    if (!interaction.member.permissions.has(permission)) {
                        const AuthorizationEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: "Authorization Required" })
                            .setDescription(Discord.codeBlock(command.authorization.permissionsError))
                            .setTimestamp()
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [AuthorizationEmbed] });
                    }
                }
    
            }
    
            if (noneEmptyStringArray(command.authorization.roles)) {
    
                for (const requiredRole of command.authorization.roles) {
                    const a = interaction.guild.roles.cache.find(role => role.id === requiredRole)
                        , b = interaction.guild.roles.cache.find(role => role.name === requiredRole);
                    const role = a || b;
                    if (!role || !interaction.member.roles.cache.has(role.id)) {
                        const RoleEmbed = new Discord.EmbedBuilder()
                            .setColor('#CC3300')
                            .setAuthor({ name: 'Missing Roles' })
                            .setDescription(Discord.codeBlock(command.authorization.rolesError))
                            .setFields([
                                {
                                    name: "Required Roles",
                                    value: role?.toString() || 'Unknown Role'
                                }
                            ])
                            .setTimestamp(Date.now())
                            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                        return interaction.reply({ embeds: [RoleEmbed] });
                    }
                }
            }

        }

        if (noneEmptyStringArray(command.authorization.banned)) {

            for (const banned of command.authorization.banned) {
                if (banned === interaction.user.id) {
                    const AuthorizationEmbed = new Discord.EmbedBuilder()
                        .setColor('#CC3300')
                        .setAuthor({ name: "Banned Notice" })
                        .setDescription(Discord.codeBlock(command.authorization.bannedError))
                        .setTimestamp()
                        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: authorAvatar })
                    return interaction.reply({ embeds: [AuthorizationEmbed] });
                }
            }
        }
    };

    try {

        if (command.cooldown.status) {

            const cdData = await cooldown.checkCommandCooldown(command.data.name, command.cooldown);

            if (cdData.active) {
                const CooldownEmbed = new Discord.EmbedBuilder()
                    .setColor('Aqua')
                    .setAuthor({ name: `${capitalizeFirstLetter(command.data.name)} Command` })
                    .setDescription(`This command still on a cooldown.\nTime Remaining: **${cdData.remaining}**`)
                    .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }).setTimestamp(cdData.end)
                return interaction.reply({ embeds: [CooldownEmbed], ephemeral: true });
            }

        }

        await command.execute(interaction, client).catch(error => { console.log(error) });

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

    };

};

module.exports = {
    CommandHandler,
    ApplicationCommandHandler
}