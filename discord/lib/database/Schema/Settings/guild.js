const mongoose = require('mongoose');

const schema = new mongoose.Schema({

    id: {
        type: mongoose.Schema.Types.String,
        required: true
    },

    data: {
        prefix: {
            type: mongoose.Schema.Types.String,
            default: 'mi!'
        },
        message: {
            leaderboard: {
                level: {
                    type: mongoose.Schema.Types.String
                },
                voice: {
                    type: mongoose.Schema.Types.String
                },
                balance: {
                    type: mongoose.Schema.Types.String
                }
            }
        },
        channel: {
            welcome: {
                main: {
                    embeds: {
                        type: mongoose.Schema.Types.Mixed
                    },
                    text: {
                        type: mongoose.Schema.Types.String
                    }
                },
                secondary: {
                    embeds: {
                        type: mongoose.Schema.Types.Mixed
                    },
                    text: {
                        type: mongoose.Schema.Types.String
                    },
                }
            },
        },
        roles: {
            rainbow: {
                type: mongoose.Schema.Types.String
            },
        },
        symbols: {
            currency: {
                type: mongoose.Schema.Types.String
            }
        }
    }


});

module.exports = mongoose.model('Guild Settings', schema, 'Guild Settings');