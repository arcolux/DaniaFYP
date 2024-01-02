require('dotenv').config();

const mqtt = require('mqtt');
const Discord = require('discord.js');
const process = require('node:process');
const { connection } = require('mongoose');
const constant = require('./lib/validation/constant.json');

const client = new Discord.Client({
    intents: 3276799,
    partials: [
		Discord.Partials.User,
		Discord.Partials.GuildMember,
		Discord.Partials.Channel,
		Discord.Partials.Message,
		Discord.Partials.Reaction,
	],
});

const MQTTClient = mqtt.connect('mqtt://broker.hivemq.com');

const Feature = require("./lib/structure/Core/Features");
const { Button, SelectMenu, ModalSubmit } = require('./lib/structure/Core/Component');
const { Events, MongooseEvents, MQTTEvents } = require('./lib/structure/Core/Events');
const { Command, ApplicationCommand, GlobalApplicationCommand } = require('./lib/structure/Core/Command');

MQTTEvents(MQTTClient);
Events(client);
Button(client);
Feature(client);
Command(client);
SelectMenu(client);
ModalSubmit(client);
ApplicationCommand(client);
MongooseEvents(connection);
GlobalApplicationCommand(client);

client.constant 	= constant
client.data			= new Discord.Collection();
client.cache		= new Discord.Collection();
client.modal        = new Discord.Collection();
client.items        = new Discord.Collection();
client.create       = new Discord.Collection();
client.voices       = new Discord.Collection();
client.button       = new Discord.Collection();
client.select       = new Discord.Collection();
client.feature      = new Discord.Collection();
client.messages     = new Discord.Collection();
client.commands     = new Discord.Collection();
client.settings	 	= new Discord.Collection();
client.personal		= new Discord.Collection();
client.levenshtein  = new Discord.Collection();

MQTTClient.data = new Discord.Collection();

client.login(process.env.BOT_TOKEN);
module.exports = { client, MQTTClient }