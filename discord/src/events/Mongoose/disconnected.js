const mongo = require('../../../lib/database/mongo')
module.exports = {
    data: {
        name: 'disconnected',
        once: true,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    execute: async (data) => {

        console.log('Disconnected from MongoDB'.red);
    }
}