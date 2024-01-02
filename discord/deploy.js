require('dotenv').config()
const { glob } = require('glob');
const ASCII = require('ascii-table');
const { promisify } = require('util');
const { Util } = require('./util/util');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { cooldown } = require('./lib/validation/validation.json');

const commandsArray = []
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {

    const PG = promisify(glob);
    const Table = new ASCII("Global Command Loaded");
    const { noneEmptyStringArray, checkEmptyString } = Util;
    Table.setHeading("Status", "Name", "Description", 'Origin');

    (await PG(`/src/data/commands/apps/SlashCommand/Global/**/*.js`, { root: process.cwd() })).map(file => {

        const path = file.split("\\");
        const command = require(file);
        
        if (!command.data) return;
        const commands = command.data.toJSON();

        if (!command.path) {
            return Table.addRow('FAILED', commands.name, 'MISSING PATH DATA', (path)[path.length - 1]);
        }

        if (command.cooldown) {

            if (isNaN(command.cooldown.time)) {
                return Table.addRow('FAILED', commands.name, 'COOLDOWN MUST BE A NUMBER', (path)[path.length - 1])
            }

            if (command.cooldown.time) {
                if (!command.cooldown.unit) {
                    return Table.addRow('FAILED', commands.name, 'MISSING COOLDOWN UNIT', (path)[path.length - 1]);
                }
    
                if (!cooldown.includes(command.cooldown.unit)) {
                    return Table.addRow('FAILED', commands.name, 'INVALID COOLDOWN UNIT', (path)[path.length - 1]);
                }
            }
    
        }

        if (command.authorization) {

            if (typeof command.authorization.status !== 'boolean') {
                return Table.addRow('FAILED', command.data.name, 'EXPECTED AUTHORIZATION STATUS MUST BE A BOOLEAN', (path)[path.length - 1]);
            }

            if (command.authorization.users) {
                if (typeof command.authorization.users === "string") {
                    command.authorization.users = [command.authorization.users];
                }

                if (noneEmptyStringArray(command.authorization.users)) {
                    if (!command.authorization.usersError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION USERS ERROR', (path)[path.length - 1]);
                    }
                }
            }

            if (command.authorization.roles) {
                if (typeof command.authorization.roles === "string") {
                    command.authorization.roles = [command.authorization.roles];
                }

                if (noneEmptyStringArray(command.authorization.roles)) {
                    if (!command.authorization.rolesError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION ROLES ERROR', (path)[path.length - 1]);
                    }
                }
            }

            if (command.authorization.banned) {
                if (typeof command.authorization.banned === "string") {
                    command.authorization.banned = [command.authorization.banned];
                }

                if (noneEmptyStringArray(command.authorization.banned)) {
                    if (!command.authorization.bannedError) {
                        return Table.addRow('FAILED', command.data.name, 'MISSING AUTHORIZATION BANNED ERROR', (path)[path.length - 1]);
                    }
                }
            }

            if (command.authorization.permissions) {
                if (!command.authorization.permissions.length) {
                    command.authorization.permissions = [command.authorization.permissions]
                }

                if (checkEmptyString(command.authorization.permissionsError)) {
                    return Table.addRow('FAILED', command.data.name, 'MISSING PERMISSION ERROR', (path)[path.length - 1]);
                }
            }
        }

        if (commands.type === 2)
            Table.addRow("SUCCESS", commands.name, "USER CONTEXT MENU", (path)[path.length - 1]);
        else if (commands.type === 3)
            Table.addRow("SUCCESS", commands.name, "MESSAGE CONTEXT MENU", (path)[path.length - 1]);
        else Table.addRow("SUCCESSFUL", commands.name, "SLASH COMMAND", (path)[path.length - 1]);

        commandsArray.push(commands);
    });

    console.log(Table.toString());
    
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commandsArray },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

})();
