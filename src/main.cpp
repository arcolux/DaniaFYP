#include <WiFi.h>
#include <Arduino.h>
#include <Adafruit_Sensor.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_TSL2561_U.h>
#include <PubSubClient.h>

#define LED 13
#define PIR 27
#define FIVE_MINUTES 1000 * 10
#define UpdateTopic "ESP32/Dania/LightUpdate"
#define SwitchTopic "ESP32/Dania/LightSwitch"
#define ControlTopic "ESP32/Dania/LightControl"

const char* ssid = "Alcy";
const char* password = "Kana2716";
const char* mqtt_server = "broker.hivemq.com";

int brightness;
int MQTTControl = 0;
int MQTTBrightness = 0;
int MQTTLightState = 0;

int isDiscordControlled = 0;

enum RoomStates {
	INITIAL_STATES,
	PEOPLE_IN_ROOM,
	MOTION_NOT_DETECTED,
	ROOM_EMPTY,
	OFF,
	ON
};

unsigned long startPIRTime = 0;

// For PIR Calibration
int motion;
int pirState = true;
int readvalue = 0;
int StableMotion = 0;
int minimumSecondForLowInactive = 10000;

long unsigned int timeLow;
boolean takeLowTime;
int callibrationTime = 1;

WiFiClient ESPClient;
PubSubClient client(ESPClient);

RoomStates LastInternalStates;
RoomStates states = INITIAL_STATES;

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 23271);

void reconnect();
void WiFiSetup();
void callback(char* topic, byte* message, unsigned int length);

void setup() {

    Serial.begin(115200);

    pinMode(PIR, INPUT);
	pinMode(LED_BUILTIN, OUTPUT);

	ledcSetup(0, 5000, 8);
	ledcAttachPin(LED, 0);

    if (!tsl.begin()) {
        Serial.println("No Sensor Was Found!");
        while (1);
    }

	WiFiSetup();
	client.setServer(mqtt_server, 1883);
	client.setCallback(callback);

	lcd.init();
	lcd.backlight();

   	Serial.println("Calibrating PIR Sensor ...");
   	for (int i = 0; i < callibrationTime; i++) {
		Serial.print(".");
        delay(1000);
	}

	delay(50); 

    tsl.enableAutoRange(true);
    tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_13MS);
}

void loop() {

	if (!client.connected()) {
		reconnect();
	}
	client.loop();

	sensors_event_t event;
	tsl.getEvent(&event);
	int lux = event.light;
	int threshold = 50;
	lcd.setCursor(0, 0);
	lcd.print("Lux Level:");
	lcd.setCursor(11, 0);
	lcd.print(lux);
	lcd.print(" ");

	readvalue = digitalRead(PIR);
	Serial.print(F("PIR Value: "));
	Serial.println(StableMotion);

	/**
	 * The motion is used to determine if there is motion in the room
	*/
	if (readvalue == HIGH) {
		digitalWrite(LED_BUILTIN, HIGH);
		if (pirState) {
			pirState = false;
			StableMotion = 1;
			delay(50);
		}
		takeLowTime = true;
	} else {
		digitalWrite(LED_BUILTIN, LOW);
		if (takeLowTime) {
			timeLow = millis();
			takeLowTime = false;
		}

		if (!pirState && millis() - timeLow > minimumSecondForLowInactive) {
			pirState = true;
			StableMotion = 0;
			delay(50);
		} 
	}

	/**
	 * The brightness is used to determine the brightness of the light
	 * from the lux value
	*/
	brightness = map(lux, 0, 400, 255, 0);
	brightness = constrain(brightness + MQTTBrightness, 0, 255);

	Serial.print(F("Lux Level: "));
	Serial.println(lux);
	Serial.print(F("Brightness Level: "));
	Serial.println(brightness);
	Serial.print(F("MQTT Brightness: "));
	Serial.println(MQTTBrightness);
	Serial.print(F("Motion Detection: "));
	Serial.println(motion);
	Serial.print(F("Current States: "));
	Serial.println(states);

	/**
	 * The states is used to determine the current states of the room
	*/
	switch (states) {
		case INITIAL_STATES:
			if (StableMotion) {
				states = PEOPLE_IN_ROOM;
			}
		break;

		case PEOPLE_IN_ROOM:
            if (!StableMotion) {
                states = MOTION_NOT_DETECTED;
                startPIRTime = millis();
            } else {
                ledcWrite(0, brightness);
            }
		break;

		case MOTION_NOT_DETECTED:
			if (StableMotion) {
				states = PEOPLE_IN_ROOM;
			} else {
				if (millis() - startPIRTime >= 10000) {
					states = ROOM_EMPTY;
				}
			}
		break;

		case ROOM_EMPTY:
			ledcWrite(0, 0);
			states = INITIAL_STATES;
		break;

		case OFF:
			if (MQTTBrightness == 0) {
				ledcWrite(0, 0);
			}
		break;
	}

	delay(250);
}

void WiFiSetup() {
	delay(10);
	Serial.print("Connecting to ");
	Serial.println(ssid);

	/**
	 * Connect to WiFi
	*/
	WiFi.begin(ssid, password);

	while (WiFi.status() != WL_CONNECTED) {
		digitalWrite(LED_BUILTIN, HIGH);
		delay(250);
		digitalWrite(LED_BUILTIN, LOW);
		delay(250);
	}

	Serial.println("WiFi Connected");
	Serial.print("IP Address: ");
	Serial.println(WiFi.localIP());
}

/**
 * Callback is use to receive message from MQTT Server
 * MQTT server is used to send data between ESP32 and Discord
 * MQTT is a protocol that is used to send data between devices
*/
void callback(char* topic, byte* message, unsigned int length) {
	String cache;

	for (int i = 0; i < length; i++) {
		cache += (char)message[i];
	}

	/**
	 * The topic is used to determine which data is being sent
	*/
	if (String(topic) == SwitchTopic) {
		/**
		 * Turn off the light
		*/
		if (cache == "OFF") {
			states = OFF;
			MQTTBrightness = 0;
			isDiscordControlled = 0;
		}
		/**
		 * Turn on the light
		*/
		if (cache == "ON") {
			MQTTBrightness = 0;
			ledcWrite(0, brightness);
			states = INITIAL_STATES;
			isDiscordControlled = 1;
		}
	}

	/**
	 * The topic is used to determine which data is being sent
	*/
	if (String(topic) == ControlTopic) {
		if (cache == "RESET") {
			char buffer[10];
			MQTTBrightness = 0;
			itoa(brightness, buffer, 10);
			client.publish(UpdateTopic, buffer);
		}
		/**
		 * Increase the brightness of the light
		*/
		if (cache == "INCREASE") {
			if (states == OFF) {
				if ((MQTTBrightness + 40) > 255) {
					MQTTBrightness = 255;
					ledcWrite(0, MQTTBrightness);
					return;
				}
				MQTTBrightness >= 255 ? 0 : MQTTBrightness += 40;
				ledcWrite(0, MQTTBrightness);
				return;
			}
			Serial.println("Code here");
			char buffer[10];
			brightness >= 255 ? 0 : MQTTBrightness += 10;
			itoa(brightness, buffer, 10);
			client.publish(UpdateTopic, buffer);
		}
		/**
		 * Decrease the brightness of the light
		*/
		if (cache == "DECREASE") {
			if (states == OFF) {
				if ((MQTTBrightness - 40) < 0) {
					MQTTBrightness = 0;
					ledcWrite(0, MQTTBrightness);
					return;
				}
				MQTTBrightness <= 0 ? 0 : MQTTBrightness -= 10;
				ledcWrite(0, MQTTBrightness);
				return;
			}
			char payload[10];
			brightness <= 0 ? 0 : MQTTBrightness -= 10;
			itoa(brightness, payload, 10);
			client.publish(UpdateTopic, payload);
		}
	}
}

/**
 * Reconnect to MQTT Server when the server is disconnected
 * This is to ensure that the ESP32 is always connected to the MQTT Server
*/
void reconnect() {
	while (!client.connected()) {
		Serial.println("Reconnecting to MQTT Server ...");

		if (client.connect("c460f065-db92-4358-a97a-926ab4d429ff")) {
			Serial.println(F("Connected to MQTT Server"));
			client.subscribe(ControlTopic);
			client.subscribe(SwitchTopic);
		} else {
			Serial.println("Connection to MQTT Failed");
			Serial.print("Client State: ");
			Serial.println(client.state());
			Serial.println("Reconnecting in 5 seconds ...");
			delay(5000);
		}
	}
}

// Discord --> MQTT --> ESP32
// ESP32 --> MQTT --> Discord