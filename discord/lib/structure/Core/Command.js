require("colors");
const ms = require('ms');
const ASCII = require('ascii-table');

const { glob } = require('glob');
const { promisify } = require('util');
const { Util } = require("../../../util/util");

const Discord = require('discord.js');
const config = require("../../validation/constant.json");
const { PermissionFlagsBits } = require('discord-api-types/v10');
const { permissions, cooldown } = require("../../validation/validation.json");

/**
 * Message Command Manager
 * @param {Discord.Client} client 
 */
async function Command(client) {

    const CommandArray = [];
    const PG = promisify(glob);
    const Table = new ASCII('Message Command');
    const { noneEmptyStringArray } = Util;
  
    (await PG(`/src/data/commands/messages/**/*.js`, { root: process.cwd() })).map(file => {
  
        const command = require(file);
        Table.setHeading('Status', 'Name', 'Description');

        if (!command.data) {
            return Table.addRow('FAILED', null, 'MISSING DATA');
        }
    
        if (!command.data.name) {
            return Table.addRow('FAILED', null, 'MISSING NAME');
        }

        // if (command.data.minArgs !== 0 || command.data.maxArgs !== null) {
        //     if (!command.data.expectedArgs) {
        //         return Table.addRow("FAILED", command.data.name, 'MISSING EXPECTED ARGS');
        //     }
        // }
    
        if (command.cooldown) {
    
            if (isNaN(command.cooldown.time)) {
                return Table.addRow('FAILED', command.data.name, 'COOLDOWN MUST BE A NUMBER')
            }

            if (command.cooldown.time) {

                if (!command.cooldown.unit) {
                    return Table.addRow('FAILED', command.data.name, 'MISSING COOLDOWN UNIT');
                }

                if (!cooldown.includes(command.cooldown.unit)) {
                    return Table.addRow('FAILED', command.data.name, 'INVALID COOLDOWN UNIT');
                }

            }
    
        }

        if (!command.information) {
            return Table.addRow('FAILED', command.data.name, 'MISSING INFORMATION DATA');
        }

        if (command.information) {

            if (!command.information.category) {
                return Table.addRow('FAILED', command.data.name, 'MISSING CATEGORY DATA');
            }

            if (!command.information.description) {
                return Table.addRow('FAILED', command.data.name, 'MISSING INFORMATION DESCRIPTION');
            }

            if (!command.information.commandUsage) {
                return Table.addRow('FAILED', command.data.name, 'MISSING INFORMATION COMMAND USAGE');
            }

            if (!command.information.commandType) {
                return Table.addRow('FAILED', command.data.name, 'MISSING INFORMATION COMMAND TYPE');
            }

            if (!command.information.permissions) {
                return Table.addRow('FAILED', command.data.name, 'MISSING INFORMATION PERMISSIONS DATA');
            }
        }

        if (command.authorization) {

            if (typeof command.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', command.data.name, 'EXPECTED AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (command.authorization.users) {
                if (typeof command.authorization.users === "string") {
                    command.authorization.users = [command.authorization.users];
                }

                if (noneEmptyStringArray(command.authorization.users)) {
                    if (!command.authorization.usersError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (command.authorization.roles) {
                if (typeof command.authorization.roles === "string") {
                    command.authorization.roles = [command.authorization.roles];
                }

                if (noneEmptyStringArray(command.authorization.roles)) {
                    if (!command.authorization.rolesError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (command.authorization.banned) {
                if (typeof command.authorization.banned === "string") {
                    command.authorization.banned = [command.authorization.banned];
                }

                if (noneEmptyStringArray(command.authorization.banned)) {
                    if (!command.authorization.bannedError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (command.authorization.permissions) {
                if (typeof command.authorization.permissions === "string") {
                    command.authorization.permissions = [command.authorization.permissions]
                }

                if (noneEmptyStringArray(command.authorization.permissions)) {

                    if (typeof command.authorization.permissions !== "string") {
                        for (const permission of command.authorization.permissions) {
                            if (!permissions.includes(permission)) {
                                return Table.addRow('FAILED', command.data.name, 'INVALID PERMISSIONS');
                            }
                        }
                    }
    
                    if (command.authorization.permissions) {
                        if (!command.authorization.permissionsError) {
                            return Table.addRow('FAILED', command.data.name, 'MISSING PERMISSION ERROR');
                        }
                    }
    
                }
            }
        }
    
        // TODO: Formatting the data type
        if (typeof command.data.aliases === 'string')
        command.data.aliases = [command.data.aliases]

        if (typeof command.authorization.users === 'string')
        command.authorization.users = [command.authorization.users]

        if (typeof command.authorization.roles === 'string')
        command.authorization.roles = [command.authorization.roles]

        if (typeof command.authorization.banned === 'string')
        command.authorization.banned = [command.authorization.banned]

        CommandArray.push(command.data.name);
        client.messages.set(command.data.name, command);
        Table.addRow("SUCCESSFUL", command.data.name, 'COMMAND LOADED');
    });
  
    console.log(Table.toString().blue);
    client.levenshtein.set('matcher', CommandArray);

};

/**
 * Application command manager
 * @param {Discord.Client} client 
 */
async function ApplicationCommand(client) {
    
    const CommandData = [];
    const CommandArray = [];
    const PG = promisify(glob);
    const { noneEmptyStringArray, checkEmptyString } = Util;
    const Table = new ASCII("Command Loaded");
    Table.setHeading("Status", "Name", "Description");

    (await PG(`/src/data/commands/apps/**/*.js`, { root: process.cwd(), ignore: "/src/data/commands/apps/SlashCommand/Global/**" })).map(async (file) => {

        const command = require(file);
        
        if (!command.data) return;
        const commands = command.data.toJSON();

        if (command.cooldown) {

            if (isNaN(command.cooldown.time)) {
                return Table.addRow('FAILED', commands.name, 'COOLDOWN MUST BE A NUMBER')
            }

            if (command.cooldown.time) {
                if (!command.cooldown.unit) {
                    return Table.addRow('FAILED', commands.name, 'MISSING COOLDOWN UNIT');
                }
    
                if (!cooldown.includes(command.cooldown.unit)) {
                    return Table.addRow('FAILED', commands.name, 'INVALID COOLDOWN UNIT');
                }
            }
    
        }

        if (command.authorization) {

            if (typeof command.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', command.data.name, 'EXPECTED AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (command.authorization.users) {
                if (typeof command.authorization.users === "string") {
                    command.authorization.users = [command.authorization.users];
                }

                if (noneEmptyStringArray(command.authorization.users)) {
                    if (!command.authorization.usersError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (command.authorization.roles) {
                if (typeof command.authorization.roles === "string") {
                    command.authorization.roles = [command.authorization.roles];
                }

                if (noneEmptyStringArray(command.authorization.roles)) {
                    if (!command.authorization.rolesError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (command.authorization.banned) {
                if (typeof command.authorization.banned === "string") {
                    command.authorization.banned = [command.authorization.banned];
                }

                if (noneEmptyStringArray(command.authorization.banned)) {
                    if (!command.authorization.bannedError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (command.authorization.permissions) {
                if (typeof command.authorization.permissions === 'string') {
                    command.authorization.permissions = [command.authorization.permissions]
                }

                const permissions = {
                    "CREATE_INSTANT_INVITE": PermissionFlagsBits.CreateInstantInvite,
                    "KICK_MEMBERS": PermissionFlagsBits.KickMembers, 
                    "BAN_MEMBERS": PermissionFlagsBits.BanMembers,
                    "ADMINISTRATOR": PermissionFlagsBits.Administrator,
                    "MANAGE_CHANNELS": PermissionFlagsBits.ManageChannels, 
                    "MANAGE_GUILD": PermissionFlagsBits.ManageGuild, 
                    "ADD_REACTIONS": PermissionFlagsBits.AddReactions,
                    "VIEW_AUDIT_LOG": PermissionFlagsBits.ViewAuditLog,
                    "PRIORITY_SPEAKER": PermissionFlagsBits.PrioritySpeaker,
                    "STREAM": PermissionFlagsBits.Stream,	
                    "VIEW_CHANNEL": PermissionFlagsBits.ViewChannel,
                    "SEND_MESSAGES": PermissionFlagsBits.SendMessages,
                    "SEND_TTS_MESSAGES": PermissionFlagsBits.SendMessages,	
                    "MANAGE_MESSAGES": PermissionFlagsBits.ManageMessages,
                    "EMBED_LINKS": PermissionFlagsBits.EmbedLinks,
                    "ATTACH_FILES": PermissionFlagsBits.AttachFiles,
                    "READ_MESSAGE_HISTORY": PermissionFlagsBits.ReadMessageHistory,
                    "MENTION_EVERYONE": PermissionFlagsBits.MentionEveryone,
                    "USE_EXTERNAL_EMOJIS": PermissionFlagsBits.UseExternalEmojis,
                    "VIEW_GUILD_INSIGHTS": PermissionFlagsBits.ViewGuildInsights,	
                    "CONNECT": PermissionFlagsBits.Connect,
                    "SPEAK": PermissionFlagsBits.Speak,
                    "MUTE_MEMBERS": PermissionFlagsBits.MuteMembers,
                    "DEAFEN_MEMBERS": PermissionFlagsBits.DeafenMembers,
                    "MOVE_MEMBERS": PermissionFlagsBits.MoveMembers,
                    "USE_VAD": PermissionFlagsBits.UseVAD,
                    "CHANGE_NICKNAME": PermissionFlagsBits.ChangeNickname,
                    "MANAGE_NICKNAMES": PermissionFlagsBits.ManageNicknames,	
                    "MANAGE_ROLES": PermissionFlagsBits.ManageRoles,
                    "MANAGE_WEBHOOKS": PermissionFlagsBits.ManageWebhooks,
                    "MANAGE_EMOJIS_AND_STICKERS": PermissionFlagsBits.ManageEmojisAndStickers,
                    "USE_APPLICATION_COMMANDS": PermissionFlagsBits.UseApplicationCommands,
                    "REQUEST_TO_SPEAK": PermissionFlagsBits.RequestToSpeak,
                    'MANAGE_EVENTS': PermissionFlagsBits.ManageEvents,
                    "MANAGE_THREADS": PermissionFlagsBits.ManageThreads,
                    "CREATE_PUBLIC_THREADS": PermissionFlagsBits.CreatePublicThreads,
                    "CREATE_PRIVATE_THREADS": PermissionFlagsBits.CreatePrivateThreads,
                    "USE_EXTERNAL_STICKERS": PermissionFlagsBits.UseExternalStickers,
                    'SEND_MESSAGES_IN_THREADS': PermissionFlagsBits.SendMessagesInThreads,
                    'USE_EMBEDDED_ACTIVITIES': PermissionFlagsBits.UseEmbeddedActivities,
                    'MODERATE_MEMBERS': PermissionFlagsBits.ModerateMembers,
                }

                // TODO: Convert string to bigint for permissions
                const temporary = [];
                for (const perm of command.authorization.permissions) {
                    temporary.push(permissions[perm])
                }
                command.authorization.permissions = temporary

                if (checkEmptyString(command.authorization.permissionsError)) {
                    return Table.addRow('FAILED', command.data.name, 'MISSING PERMISSION ERROR');
                }
            }
        }

        if (commands.type === 2)
            Table.addRow("SUCCESS", commands.name, "USER CONTEXT MENU");
        else if (commands.type === 3)
            Table.addRow("SUCCESS", commands.name, "MESSAGE CONTEXT MENU");
        else Table.addRow("SUCCESSFUL", commands.name, "SLASH COMMAND");

        CommandData.push(command);
        CommandArray.push(commands);
        client.commands.set(commands.name, command);
    });

    console.log(Table.toString().green);

    client.on('ready', async (client) => {

        console.log('(/) Refreshing Slash Command')
        const mainGuild = client.guilds.cache.get(config.data.guidId);
        await mainGuild.commands.set(CommandArray);
        console.log('(/) Slash Command Refreshed')

    });

};

/**
 * Application command manager
 * @param {Discord.Client} client 
 */
async function GlobalApplicationCommand(client) {

    const PG = promisify(glob);
    const { noneEmptyStringArray, checkEmptyString } = Util;
    const Table = new ASCII("Global Command Loaded");
    Table.setHeading("Status", "Name", "Description");

    (await PG(`/src/data/commands/apps/SlashCommand/Global/**/*.js`, { root: process.cwd() })).map(async (file) => {

        const path = file.split("\\");
        const command = require(file);

        if (!command.data) return;
        const commands = command.data.toJSON();

        if (!command.path) {
            return Table.addRow('FAILED', commands.name, 'MISSING PATH DATA');
        }

        if (command.cooldown) {

            if (isNaN(command.cooldown.time)) {
                return Table.addRow('FAILED', commands.name, 'COOLDOWN MUST BE A NUMBER')
            }

            if (command.cooldown.time) {
                if (!command.cooldown.unit) {
                    return Table.addRow('FAILED', commands.name, 'MISSING COOLDOWN UNIT');
                }

                if (!cooldown.includes(command.cooldown.unit)) {
                    return Table.addRow('FAILED', commands.name, 'INVALID COOLDOWN UNIT');
                }

                if (!command.cooldown.type) {
                    return Table.addRow('FAILED', commands.name, 'MISSING COOLDOWN TYPE');
                }

                if (!cooldownType.includes(command.cooldown.type)) {
                    return Table.addRow('FAILED', commands.name, 'INVALID COOLDOWN TYPE');
                }
            }

        }

        if (command.authorization) {

            if (typeof command.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', command.data.name, 'EXPECTED AUTHORIZATION STATUS MUST BE A BOOLEAN');
            }

            if (command.authorization.users) {
                if (typeof command.authorization.users === "string") {
                    command.authorization.users = [command.authorization.users];
                }

                if (noneEmptyStringArray(command.authorization.users)) {
                    if (!command.authorization.usersError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION USERS ERROR');
                    }
                }
            }

            if (command.authorization.roles) {
                if (typeof command.authorization.roles === "string") {
                    command.authorization.roles = [command.authorization.roles];
                }

                if (noneEmptyStringArray(command.authorization.roles)) {
                    if (!command.authorization.rolesError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION ROLES ERROR');
                    }
                }
            }

            if (command.authorization.banned) {
                if (typeof command.authorization.banned === "string") {
                    command.authorization.banned = [command.authorization.banned];
                }

                if (noneEmptyStringArray(command.authorization.banned)) {
                    if (!command.authorization.bannedError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION BANNED ERROR');
                    }
                }
            }

            if (command.authorization.permissions) {
                if (!command.authorization.permissions.length) {
                    command.authorization.permissions = [command.authorization.permissions]
                }

                if (checkEmptyString(command.authorization.permissionsError)) {
                    return Table.addRow('FAILED', command.data.name, 'MISSING PERMISSION ERROR');
                }
            }
        }

        if (commands.type === 2)
            Table.addRow("SUCCESS", commands.name, "USER CONTEXT MENU");
        else if (commands.type === 3)
            Table.addRow("SUCCESS", commands.name, "MESSAGE CONTEXT MENU");
        else Table.addRow("SUCCESSFUL", commands.name, "SLASH COMMAND");

        client.commands.set(commands.name, command);
    });

    console.log(Table.toString().green);
};

module.exports = {
    Command,
    ApplicationCommand,
    GlobalApplicationCommand
}