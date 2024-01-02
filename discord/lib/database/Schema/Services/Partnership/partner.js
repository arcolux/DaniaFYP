const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.String,
            required: true
        },
        username: {
            type: mongoose.Schema.Types.String
        }
    },
    guild: {
        id : {
            type: mongoose.Schema.Types.String,
            required: true
        },
        pending: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        },
        invite: {
            type: mongoose.Schema.Types.String,
            required: true
        },
        partnered: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        },
        break: {
            type: mongoose.Schema.Types.Boolean,
            default: false
        }
    },
    message: {
        ad: {
            type: mongoose.Schema.Types.String
        },
        list: {
            type: mongoose.Schema.Types.String
        },
        editor: {
            type: mongoose.Schema.Types.String
        }
    }

}, { timestamps: true });

module.exports = mongoose.model("Partnership Manager", schema, "Partnership Manager");