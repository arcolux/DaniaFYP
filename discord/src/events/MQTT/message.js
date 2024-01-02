const mqtt = require('mqtt');

module.exports = {
    data: {
        name: 'message',
        once: false,
    },
    /**
     * 
     * @param {string} topic 
     * @param {Buffer} message 
     * @param {mqtt.IPublishPacket} packet 
     */
    execute: async (topic, message, packet, client) => {

        if (topic === "ESP32/Dania/LightUpdate") {
            console.log(message.toString());
        }
    }
}