const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    
    guildId: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    inviteLink: {
        type:mongoose.Schema.Types.String,
        default: 'none'
    },
    
    adMessageId: {
        type: mongoose.Schema.Types.String,
    },

    listMessageId: {
        type: mongoose.Schema.Types.String
    },

    editorMessageId: {
        type: mongoose.Schema.Types.String
    }

}, { timestamps: true });

module.exports = mongoose.model("Partnership Test Manager", schema, "Partnership Test Manager");