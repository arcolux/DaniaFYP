const mqtt = require('mqtt');

module.exports = {
    data: {
        name: 'connect',
        once: false,
    },
    /**
     * @param {mqtt.Packet} packet
     * @param {mqtt.MqttClient} client 
     */
    execute: async (packet, client) => {
        console.log('Connected to MQTT broker');

        client.subscribe("ESP32/Dania/LightControl", (err) => {
            if (!err) {
                console.log('Subscribed to topic: ESP32/Dania/LightControl');
            }
        });

        client.subscribe("ESP32/Dania/LightSwitch", (error) => {
            if (!error) {
                console.log("Subscribed to topic: ESP32/Dania/LightSwitch");
            }
        })

        client.subscribe("ESP32/Dania/LightUpdate", (error) => {
            if (!error) {
                console.log("Subscribed to topic: ESP32/Dania/LightUpdate");
            }
        })

        // Publish a message after a delay
        setTimeout(() => {
            client.publish("ESP32/Dania/LightControl", 'NodeJS Connected');
            client.publish("ESP32/Dania/LightSwitch", 'NodeJS Connected');
        }, 2000);
    }
}