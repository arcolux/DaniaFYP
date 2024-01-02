module.exports = {
    data: {
        name: 'connected',
        once: true,
    },
    path: {
		dir		 : __dirname,
		file	 : __filename,
		relative : __filename.replace(process.cwd(), "").replace(/\\/g, "/")
	},
    execute: async (data) => {
        console.log('Connected to MongoDB'.green);
    }
}