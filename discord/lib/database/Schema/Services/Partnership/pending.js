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

    active: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },

}, { timestamps: true });

module.exports = mongoose.model("Partnership Pending Manager", schema, "Partnership Pending Manager");