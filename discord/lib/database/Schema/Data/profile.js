const mongoose = require('mongoose');
require('mongoose-long')(mongoose);

const schema = new mongoose.Schema({
    user: {
        id: {
            type: mongoose.Schema.Types.String,
            required: true
        },
        username: {
            type: mongoose.Schema.Types.String
        },
        invetory: {
            roles: {
                type: mongoose.Schema.Types.Array
            }
        },
        economy: {
            limit: {
                type: mongoose.Schema.Types.Number,
                default: 50000
            },
            balance: {
                type: mongoose.Schema.Types.Number,
                default: 0
            },
        },
        progress: {
            level: {
                type: mongoose.Schema.Types.Number,
                default: 1
            },
            xp: {
                type: mongoose.Schema.Types.Number,
                default: 0
            }
        },
        commands: {
            daily: {
                streak: mongoose.Schema.Types.Number,
                lastClaimed: mongoose.Schema.Types.Date,
                totalClaimed: mongoose.Schema.Types.Number
            }
        },
    },
    guild: {
        id: {
            type: mongoose.Schema.Types.String
        },
        messages: {
            word: {
                type: mongoose.Schema.Types.Number,
                default: 0
            },
            character: {
                type: mongoose.Schema.Types.Number,
                default: 0
            },
        },
        voices: {
            time: {
                type: mongoose.Schema.Types.Long,
                default: 0
            }
        }
    }
})

module.exports = mongoose.model('User Profile', schema, 'User Profile');