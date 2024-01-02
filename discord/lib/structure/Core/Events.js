const mqtt = require('mqtt');
const { glob } = require('glob');
const ASCII = require('ascii-table');
const { promisify } = require('util');

const Discord = require('discord.js');
const { connection } = require('mongoose');
const { events, distube: distubeEvents } = require('../../validation/validation.json');
const process = require('process');

/**
 * @param {Discord.Client} client 
 */
async function Events(client) {

    const PG = promisify(glob);
    const Table = new ASCII('Loaded Events');
    Table.setHeading("Status", "Event", "Description", "Origin");

    (await PG(`/src/events/Discord/**/*.js`, { root: process.cwd() })).map(async (file) => {

        const event = require(file);
        const path = file.split("\\");

        if (!event.data) {
            return Table.addRow('FAILED', null, 'MISSING DATA');
        }

        if (!event.data.name) {
            return Table.addRow('FAILED', null, 'MISSING NAME');
        }
        
        if (!events.includes(event.data.name)) {
            return Table.addRow("FAILED", event.data.name, "INVALID EVENT");
        }

        if (event.once) {
            client.once(event.data.name, (...args) => event.execute(...args, client))
        } else {
            client.on(event.data.name, (...args) => event.execute(...args, client))
        };

        Table.addRow("SUCCESS", event.data.name, 'Event Loaded');
    });

    console.log(Table.toString().blue);
    
};

/**
 * 
 * @param {mqtt.MqttClient} client 
 */
async function MQTTEvents(client) {
    const PG = promisify(glob);
    const Table = new ASCII('MQTT Event');
    Table.setHeading('Status', 'Event', 'Description');

    (await PG(`/src/events/MQTT/**/*.js`, { root: process.cwd() })).map(async (file) => {
        const event = require(file);

        if (!event.data) {
            return Table.addRow('FAILED', null, 'MISSING DATA');
        }

        if (!event.data.name) {
            return Table.addRow('FAILED', null, 'MISSING NAME');
        }

        if (event.once) {
            client.once(event.data.name, (...args) => event.execute(...args, client))
        } else {
            client.on(event.data.name, (...args) => event.execute(...args, client))
        };

        Table.addRow("SUCCESS", event.data.name, 'Event Loaded');
    })
}

/**
 * 
 * @param {connection} connection 
 */
async function MongooseEvents(connection) {

    const PG = promisify(glob);
    const Table = new ASCII('Mongoose Events');
    Table.setHeading("Status", "Event", "Description", "Origin");

    (await PG(`/src/events/Mongoose/**/*.js`, { root: process.cwd() })).map(async (file) => {

        const event = require(file);
        const path = file.split("\\");

        if (!event.data) {
            return Table.addRow('FAILED', null, 'MISSING DATA');
        }

        if (!event.data.name) {
            return Table.addRow('FAILED', null, 'MISSING NAME');
        }

        if (event.once) {
            connection.once(event.data.name, (...args) => event.execute(...args))
        } else {
            connection.on(event.data.name, (...args) => event.execute(...args))
        };

        Table.addRow("SUCCESS", event.data.name, 'Event Loaded');
    });

    console.log(Table.toString().blue);
}

/**
 * 
 * @param {process} process 
 */
async function NodeProcess(process, client) {

    const PG = promisify(glob);
    const Table = new ASCII('Node Process Events');
    Table.setHeading("Status", "Event", "Description", "Origin");

    (await PG(`/src/events/NodeProcess/**/*.js`, { root: process.cwd() })).map(async (file) => {

        const event = require(file);
        const path = file.split("\\");

        if (!event.data) {
            return Table.addRow('FAILED', null, 'MISSING DATA');
        }

        if (!event.data.name) {
            return Table.addRow('FAILED', null, 'MISSING NAME');
        }

        if (event.once) {
            process.once(event.data.name, (...args) => event.execute(...args, client))
        } else {
            process.on(event.data.name, (...args) => event.execute(...args, client))
        };

        Table.addRow("SUCCESS", event.data.name, 'Event Loaded');
    });

    console.log(Table.toString().blue);
}

module.exports = {
    Events,
    MQTTEvents,
    MongooseEvents,
    NodeProcess
}