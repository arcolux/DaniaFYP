const Discord = require('discord.js')
const fetch = require('node-fetch')

/**
 * 
 * @param {Discord.Client} client 
 * @param {Discord.Message} message 
 * @returns 
 */
async function chatbot(client, message) {

	if (message.author.bot) return

	try {

		const ranges = [
			'\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
			'\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
			'\ud83d[\ude80-\udeff]' // U+1F680 to U+1F6FF
		]

		console.log(message.cleanContent)

		let input = message.cleanContent.replace(
			new RegExp(ranges.join('|'), 'g'),
			'.'
		)

		//Replacing Emojis
		input = input.replace(/<a?:.+:\d+>/gm, '')

		await message.channel.sendTyping()

		const url = new URL('https://api.affiliateplus.xyz/api/chatbot'),
			params = url.searchParams

		params.set('message', input)
		params.set('creator', 'Arcolux#1123')
		params.set('botname', client.user.username)
		params.set('birthyear', client.user.createdAt.getFullYear())
		params.set('birthdate', client.user.createdAt.toLocaleDateString())
		params.set('birthplace', 'Malaysia')
		params.set('location', message.guild.name)
		params.set('company', 'Starz')
		params.set('user', message.author.id)

		// Using await instead of .then
		const jsonRes = await fetch(url).then((res) => res.json()) // Parsing the JSON

		const chatbotReply = jsonRes.message
			.replace(/@everyone/g, '`@everyone`') //RegExp with g Flag will replace every @everyone instead of just the first
			.replace(/@here/g, '`@here`')
		
			console.log(chatbotReply)

		await message.reply({
			content: chatbotReply,
			allowedMentions: { repliedUser: false }
		})
	} catch (err) {
		if (err instanceof fetch.FetchError) {
			if (err.type === 'invalid-json') {
				message.reply({ content: 'Sorry I cannot process your message' })
			}
		} else console.log(`Error Occured. | chatbot | Error: ${err.stack}`)
	}
}

module.exports = {
	chatbot
}