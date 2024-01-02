module.exports = {
    data: {
        name: 'disconnecting',
        once: true,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    execute: async (data) => {
        console.log('Disconnecting from MongoDB'.yellow);
    }
}