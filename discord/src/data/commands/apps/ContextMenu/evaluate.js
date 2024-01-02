const { inspect } = require('util');
const Discord = require('discord.js');
const { ContextMenuCommandBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Evaluate')
        .setType(3),
    cooldown: {
        time: 0,
        unit: '',
        status: false,
    },
    authorization: {
        status: true,
        users: ['747074554089963540'],
        roles: [''],
        banned: [''],
        usersError: "You're not authorize to use this command",
        rolesError: '',
        bannedError: '',
        permissions: '',
        permissionsError: '',
    },
    /**
     * @param {Discord.ContextMenuCommandInteraction} interaction
     * @param {Discord.Client} client
     */
    async execute(interaction, client) {

        const id = interaction.targetId
        const message = await interaction.channel.messages.fetch(id);

        const cleanMessage = message.content.replace(/```js|```|``/g, '');

        const filter = ['process.exit()', 'process.env.token', 'process.env', 'client.login(process.env.token)', 'process']

        for (const illegal of filter) {
            if (filter.includes(cleanMessage) || cleanMessage.toLowerCase().includes(illegal)) {
                return interaction.reply({ content: 'Illegal command detected', ephemeral: true })
            }
        }

        try {

            const StartTime = performance.now();
            const result = await eval(cleanMessage);
            const EndTime = performance.now();

            const Resultime = EndTime - StartTime

            let output = result
            if (typeof result !== 'string') {
                output = inspect(result)
            }

            const EvalEmbed = new Discord.EmbedBuilder()
                .setColor('#CC3300')
                .setAuthor({ name: 'Evaluation Result' })
                .setDescription(Discord.codeBlock('js', output))
                .setFields([
                    {
                        name: 'Time Taken',
                        value: Discord.codeBlock('arm', `${Resultime} miliseconds`)
                    },
                    {
                        name: 'Code',
                        value: Discord.codeBlock('js', cleanMessage)
                    }
                ])
            interaction.reply({ embeds: [EvalEmbed], ephemeral: true }).catch(error => {
                const ErrorEmbed = new Discord.EmbedBuilder()
                    .setColor('#CC3300')
                    .setAuthor({ name: 'Embed Error' })
                    .setDescription(Discord.codeBlock('js', error))
                interaction.reply({ embeds: [ErrorEmbed], ephemeral: true });
            });

        } catch (error) {

            const ErrorEmbed = new Discord.EmbedBuilder()
                .setColor('#CC3300')
                .setAuthor({ name: 'An Error Occured' })
                .setDescription(Discord.codeBlock('js', cleanMessage))
                .setFields([
                    {
                        name: '\u200b',
                        value: Discord.codeBlock('js', error.toString())
                    }
                ])
            interaction.reply({ embeds: [ErrorEmbed], ephemeral: true }).catch(error => console.log('Error In Catch', error));

        };
    }
}