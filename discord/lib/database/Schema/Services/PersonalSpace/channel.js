const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    
    guildId: {
        type: String,
        required: true
    },

    lastJoined: {
        type: Date,
    },

    voiceChannelId: {
        type: String
    },

    verification: {
        status: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        },
        code: {
            type: mongoose.Schema.Types.String,
        },
        verified: {
            type: mongoose.Schema.Types.Array,
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("Personal Space", schema, "Personal Space");