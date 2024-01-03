const mqtt = require('mqtt');
const Discord = require('discord.js');
const config = require('./config.json');
const { Util } = require('./util/util');

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

const MQTTClient = mqtt.connect(config.mqtt);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}.`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith('mi!send')) {

        await message.delete();
        const brightness = Util.filledProgessBar(255, 0, 12, '⬜', '🟩');

        const ControlEmbed = new Discord.EmbedBuilder()
            .setColor('Green')
            .setAuthor({ name: 'Luminosity Lighting System', iconURL: message.guild.iconURL() })
            .setFields([
                {
                    name: 'Brightness',
                    value: `${brightness[0]} ${Math.floor(brightness[1])}%`,
                    inline: true
                },
                {
                    name: "Light State",
                    value: "💡 | ON"
                }
            ])
            .setImage('https://cdn.discordapp.com/attachments/1096710772752658513/1141705969278140497/98e32998-5b66-4281-aa4d-8c4f45a51e60.jpg?ex=653a578a&is=6527e28a&hm=00eb57ae37581b2d13d7130920669538bc1058a60489643df82e1f83cc69118a&')
            .setFooter({ text: 'Control the light by using the button below.' });
        const button = [
            new Discord.ButtonBuilder()
                .setCustomId('INCREASE_BRIGHTNESS')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji('➕'),
            new Discord.ButtonBuilder()
                .setCustomId('ON')
                .setStyle(Discord.ButtonStyle.Success)
                .setLabel('ON'),
            new Discord.ButtonBuilder()
                .setCustomId('OFF')
                .setStyle(Discord.ButtonStyle.Danger)
                .setLabel('OFF'),
            new Discord.ButtonBuilder()
                .setCustomId('DECREASE_BRIGHTNESS')
                .setStyle(Discord.ButtonStyle.Primary)
                .setEmoji('➖'),
            new Discord.ButtonBuilder()
                .setCustomId("RESET_BRIGHTNESS")
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel("Reset")
        ]
        const component = new Discord.ActionRowBuilder()
            .setComponents(button)
        message.channel.send({ embeds: [ControlEmbed], components: [component] });
    }
})

client.on('interactionCreate', async interaction => {
    switch (interaction.customId) {
        case 'INCREASE_BRIGHTNESS':
            await interaction.deferUpdate();
            MQTTClient.publish('ESP32/Dania/LightControl', 'INCREASE');
        break;

        case 'DECREASE_BRIGHTNESS':
            await interaction.deferUpdate();
            MQTTClient.publish('ESP32/Dania/LightControl', 'DECREASE');
        break;

        case 'RESET_BRIGHTNESS':
            await interaction.deferUpdate();
            MQTTClient.publish('ESP32/Dania/LightControl', 'RESET');
        break;

        case 'ON':
            await interaction.deferUpdate();
            MQTTClient.publish('ESP32/Dania/LightSwitch', 'ON');
        break;

        case 'OFF':
            await interaction.deferUpdate();
            MQTTClient.publish('ESP32/Dania/LightSwitch', 'OFF');
        break;
    }
});

MQTTClient.on('connect', () => {
    console.log('MQTT Client connected.');
});

MQTTClient.on('message', (topic, message) => {
    console.log(`[${topic}] ${message}`);
});

client.login(config.token);