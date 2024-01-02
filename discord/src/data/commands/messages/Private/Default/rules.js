require('dotenv').config();
const Discord = require('discord.js');

module.exports = {
    data: {
        name                : "rules",
        aliases             : "",
        minArgs             : 1,
        maxArgs             : null,
        expectedArgs        : "rules <type>",
    },
	path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    cooldown: {
        time    : 0,
        unit    : "",
        type    : "",
        status  : false,
    },
    information         : {
        name            : 'rules',
        category        : "Private",
        description     : "Send an embed contain rules",
        commandType     : "Private",
        permissions     : "Not Available",
        commandUsage    : `rules <type>`,

    },
    authorization: {
        status  : true,
        users   : "747074554089963540",
        roles   : "",
        banned  : "",
        usersError  : "Your're not authorized to use this command",
        rolesError  : "",
        bannedError : "",
        permissions : "",
        permissionsError : "",
    },
    /**
     * @param {Discord.Message} message 
     * @param {string[]} arguments
     * @param {string} text
     * @param {Discord.Client} client 
     */
    async execute(message, arguments, text, client) {

        const type = [
            'general',
            'administration',
        ]

        if (!type.includes(arguments[0])) {
            return message.channel.send({ content: 'The rules type is not valid' })
        }

        switch (arguments[0]) {
            case 'general':
                const EmbedOne = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Every Member Should Be Respected')
                    .setDescription(`Above everything, respect is the most important thing to follow. It is important that you respect each and every member, regardless of what religious belief they have.

                    If you wish to be respected back in return, it is imperative that you first give out respect. `)
                const EmbedTwo = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Abusive Language is Unacceptable')
                    .setDescription(`Irrespective of what language you use, always refrain from using any offensive words that might hurt some other member.

                    Make sure to keep your calm and only use language that is acceptable. `)
                const EmbedThree = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Refrain From Spamming')
                    .setDescription(`Avoid spamming at all costs.

                    Be it messages, pictures or emojis, send everything in moderation and do not bombard the chat with unnecessary things that will make the members miss out on important messages.
                    
                    Give other users a chance too. `)
                const EmbedSix = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('No NSFW Content')
                    .setDescription(`Our server is built keeping in mind users of every age. Sexual content will not be entertained.

                    This server is meant for families so that users of every age can enjoy the content on our server.
                    NSFW are controlled contents and only allowed in the designated channels. `)
                const EmbedSeven = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Seek Permission Before Advertising')
                    .setDescription(`If you wish to advertise something on our server, be it a product or service, or anything else, it is vital that you first ask the permission of the moderators who will review your ad and then accept or reject it.

                    We have a separate channel for advertisements, so make sure to use that. `)
                const EmbedEight = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Appropriate Display Pictures and Nicknames Are Mandatory')
                    .setDescription(`Our Discord Server is all about maintaining a well-behaved group of users hence, be certain to use only appropriate display pictures and nicknames.

                    Keep away from using offensive display pictures pertaining to any religious propaganda or sexual content that might hurt other users.
                    
                    Users will be removed from the server if they don’t pay any heed to this warning.`)
                const EmbedNine = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Raiding of Other Servers')
                    .setDescription(`We do not encourage the members of our server to raid other Discord servers, especially when done without seeking permission first.

                    Always make sure to get permission from a moderator for doing something like that, or else you will be banned forever.`)
                const EmbedTen = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Refrain From Threatening People')
                    .setDescription(`Threatening other users on our Discord server is absolutely prohibited.

                    Threats of any kind, be it hack threats, threats relating to death, abuse, or any other such malevolent messages will not be entertained and members who will be using such threats will be banned without any further thought. `)
                const EmbedEleven = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Follow The Guidelines Stated By Discord')
                    .setDescription(`While following the rules of our specific server is important, it is equally important to follow the official [guidelines](https://discord.com/guidelines) as stated by Discord.

                    It is imperative that you respect Discord and its rules if you do not want to be banned by the platform.  `)
                const EmbedTwelve = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('The Administrators or Moderators Can Take Action on Members')
                    .setDescription(`Even after going through these rules, if there are members who do not care to follow these, the admins or moderators will not hesitate to take necessary action.

                    Our Discord server is all about maintaining a proper decorum where users of every kind can enjoy a comfortable environment. 
                    
                    As a result, we equally encourage other users to let us know if members are violating the rules or making anyone uncomfortable.
                    
                    We keep in mind the well-being of every member and always strive to better our community of Discord servers. So, if you face any such issue, reach out to us.`)
                const EmbedThirteen = new Discord.EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Discord Server Rules To Be Followed')
                    .setDescription(`If you want the rules to be short and crisp that will make every user check them out and courteously follow them, then you can just copy and paste the following discord server rules template.

                    We have compiled the most common and basic rules that should be followed in every Discord server. 
                    
                    1. Be kind, polite, and friendly.\n
                    2. Offensive or harmful messages will not be entertained. \n
                    3. Spamming is discouraged.\n
                    4. Our server is meant for private conversations, not for promotion. \n
                    5. Using the server for dating purposes is not appreciated. \n
                    6. Conduct conversations in English so that every member can understand. \n
                    7. Offensive display pictures or nicknames are not allowed, under any circumstance. \n
                    8. Conversations on politics or religion are not encouraged since they can spark controversies.  \n
                    9. Fake identities are not allowed and make sure to use your real name and photo. \n
                    10. Do not send links to phishing or scam websites. \n
                    11. Spoilers are prohibited, be it from a movie, an anime, or any TV show. \n
                    12. Our server is meant for family environments so make sure not to send any non-PG, adult, or erotic texts. \n
                    13. Hate speech is not entertained and members found using that will be removed. \n
                    14. Do not encourage other users to violate rules since it is equally problematic. \n
                    15. Plagiarism of any kind is strongly discouraged within our server; credit people where it is due. \n
                    16. Contacting server members without any proper reason is not allowed. \n
                    17. Do not join our server with the aim of creating a sub-server with our members. \n
                    18. A warning will be given on the violation of regulation; however, members will be removed if they are found doing it again.\n
                    19. Feedback, as well as constructive criticism, are always welcome. \n
                    20. No matter what age, respect each and every user. \n
                    These rules are flexible and mods or admins are allowed to change these rules or ban users on the basis of the same. \n`)
            const EmbedFourteen = new Discord.EmbedBuilder()
                .setColor('Red')
                .setTitle('Final Thoughts')
                .setDescription(`Rules are important in any kind of social media group but more so for Discord where it becomes difficult to manage such a large group of members on a server.`)
                .setFooter({ text: 'Last Revised: ' + new Date().toLocaleString() })

            const rulesEmbed = [EmbedOne, EmbedTwo, EmbedThree, EmbedSix, EmbedSeven, EmbedEight, EmbedNine, EmbedTen, EmbedEleven, EmbedTwelve, EmbedThirteen, EmbedFourteen] 

            for (let i = 0; i < rulesEmbed.length; i++) {
                message.channel.send({ embeds: [rulesEmbed[i]] });
            }
        }

    }
}