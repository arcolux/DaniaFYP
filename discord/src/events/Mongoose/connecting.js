module.exports = {
    data: {
        name: 'connecting',
        once: true,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    execute: async (data) => {
        console.log('Connecting to MongoDB'.yellow);
    }
}