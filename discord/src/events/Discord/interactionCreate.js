const Discord = require('discord.js');
const { InteractionType } = require("discord-api-types/v10");
const { ApplicationCommandHandler } = require('../../../lib/handler/CommandHandler');
const { ButtonHandler, SelectMenuHandler, ModalHandler } = require('../../../lib/handler/ComponentHandler');

module.exports = {
    data: {
        name: 'interactionCreate',
        once: false,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    /**
     * @param {Discord.Interaction} interaction 
     * @param {Discord.Client} client 
     */
    execute : async (interaction, client) => {

        if (interaction instanceof Discord.ButtonInteraction) {
            return ButtonHandler(interaction, client);
        }
        
        if (interaction instanceof Discord.StringSelectMenuInteraction) {
            return SelectMenuHandler(interaction, client);
        }

        if (interaction.type === InteractionType.ModalSubmit) {
            return ModalHandler(interaction, client);
        }

        if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            return ApplicationCommandHandler(interaction, client)
        }

        if (interaction.type === InteractionType.ApplicationCommand) {
            return ApplicationCommandHandler(interaction, client)
        }

    }
}