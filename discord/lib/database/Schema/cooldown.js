const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.String,
        required: true
    },
    commands: {
        message: {
            data: mongoose.Schema.Types.Mixed
        },
        application: {
            data: mongoose.Schema.Types.Mixed
        },
        
        user: {
            data: mongoose.Schema.Types.Mixed,
        },
    },
    components: {
        modal: {
            data: mongoose.Schema.Types.Mixed
        },
        button: {
            data: mongoose.Schema.Types.Mixed
        },
        selectmenu: {
            data: mongoose.Schema.Types.Mixed
        },

        user: {
            data: mongoose.Schema.Types.Mixed,
        },
    }
});

module.exports = mongoose.model("Cooldown Manager", schema, "Cooldown Manager");