#include <WiFi.h>
#include <PubSubClient.h>

// Datele rețelei Wi-Fi
const char* ssid = "TP-Link_F6B8";
const char* password = "21580260";

// Datele serverului MQTT
const char* mqtt_server = "test.mosquitto.org";
const char* mqtt_client_id = "ESP32Dorin";

// Topic-urile MQTT
const char* topic_control = "topic/control";
const char* topic_date = "topic/date";

// Pinul releului (modifică dacă este necesar)
const int releuPin = 5;
int stareReleu = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(releuPin, OUTPUT);
  digitalWrite(releuPin, LOW); // Inițial releul este oprit

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectare la Wi-Fi...");
  }

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Publică date la fiecare 5 secunde (modifică intervalul dacă este necesar)
  static unsigned long lastPublishTime = 0;
  if (millis() - lastPublishTime > 500) {
    publishData(stareReleu);
    lastPublishTime = millis();
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Încercare de conectare la MQTT...");
    if (client.connect(mqtt_client_id)) {
      Serial.println("Conectat la MQTT!");
      client.subscribe(topic_control);
    } else {
      Serial.print("Eșec, cod de eroare = ");
      Serial.print(client.state());
      Serial.println(" Încercare din nou în 5 secunde...");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Mesaj primit pe topicul: ");
  Serial.println(topic);
  Serial.print("Mesaj: ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  if (strcmp(topic, topic_control) == 0) {
    if (strncmp((char*)payload, "aprinde", length) == 0) {
      digitalWrite(releuPin, HIGH);
      Serial.print("RELEU APRINS   ");
      stareReleu = 1;
      Serial.println(stareReleu);
    } else if (strncmp((char*)payload, "stinge", length) == 0) {
      digitalWrite(releuPin, LOW);
      Serial.print("RELEU STINS  ");
      stareReleu = 0;
      Serial.println(stareReleu);
    }
  }
}

void publishData(int stareReleu) {
  // Exemplu: valoarea unui senzor analogic
  if(stareReleu == 1){
      client.publish(topic_date, String("Releu este Aprins").c_str());
      Serial.println("Date publicate!_APRINS");
  }
  if(stareReleu == 0){
      client.publish(topic_date, String("Releu este Stins").c_str());
      Serial.println("Date publicate!_STINS");
  }
}