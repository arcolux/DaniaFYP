const mongoose = require('mongoose');
require('mongoose-long')(mongoose);

const schema = new mongoose.Schema({
    id: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    data: {
        item: {
            roles: {
                type: mongoose.Schema.Types.Array
            },
            consumable: {}
        },
        server: {
            messages: {
                type: mongoose.Schema.Types.Number,
                default: 0
            },
            voice: {
                type: mongoose.Schema.Types.Long,
                default: 0
            }
        },
        economy: {
            balance: {
                type: mongoose.Schema.Types.Number,
                default: 0
            },
            balanceLimit: {
                type: mongoose.Schema.Types.Number,
                default: 50000
            }
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
        accessory: {
            banner: {
                active: {
                    type: mongoose.Schema.Types.String,
                    default: 'none'
                },
                owned: mongoose.Schema.Types.Array
            }
        },
        commands: {
            daily: {
                streak: mongoose.Schema.Types.Number,
                lastClaimed: mongoose.Schema.Types.Date,
                totalClaimed: mongoose.Schema.Types.Number
            }
        },
        boost: {
            xp: {
                type: mongoose.Schema.Types.Number,
                default: 1
            },
            currency: {
                type: mongoose.Schema.Types.Number,
                default: 1
            }
        }
    }
})

module.exports = mongoose.model('User Profile a', schema, 'User Profile a');