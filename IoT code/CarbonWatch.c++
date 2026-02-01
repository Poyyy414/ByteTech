#include "DHT.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------- DHT22 ----------
#define DHTPIN 19
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ---------- MQ-2 ----------
const int sensorPin = 34;
const float Vcc = 5.0;
const float R_L = 10000.0;
const float Ro = 10000.0;
const float ADC_MAX = 4095.0;

// ---------- WiFi ----------
const char* ssid = "YOTC-B95D37";
const char* password = "55912547";
const char* serverUrl = "https://bytetech.onrender.com/api/post-sensor-data";

// ---------- Sensor ID ----------
const int sensor_id = 1;

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi Connected");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() != WL_CONNECTED) return;

  // ---------- MQ-2 ----------
  int adcReading = analogRead(sensorPin);
  float Vout = (adcReading / ADC_MAX) * Vcc;
  if (Vout <= 0) Vout = 0.0001;

  float Rs = R_L * (Vcc / Vout - 1);
  float RsRo = Rs / Ro;

  float ppm = 1000.0 * pow(RsRo, -2.3);
  float mg_per_m3 = ppm * 16.04 / 24.45;
  float g_co2 = (mg_per_m3 / 1000.0) * (44.01 / 16.04);

  // ---------- Carbon Level ----------
  String carbonLevel;
  if (g_co2 < 0.08) carbonLevel = "LOW";
  else if (g_co2 < 0.15) carbonLevel = "NORMAL";
  else if (g_co2 < 0.20) carbonLevel = "HIGH";
  else carbonLevel = "VERY HIGH";

  // ---------- DHT22 ----------
  float humidity = dht.readHumidity();
  float temperature_c = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature_c)) {
    Serial.println(" DHT read failed");
    delay(2000);
    return;
  }

  // ---------- HTTP ----------
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> json;
  json["sensor_id"] = sensor_id;
  json["mq2_analog"] = adcReading;
  json["methane_ppm"] = ppm;
  json["co2_density"] = g_co2;
  json["temperature_c"] = temperature_c;
  json["humidity"] = humidity;

  String requestBody;
  serializeJson(json, requestBody);

  int httpResponseCode = http.POST(requestBody);

  Serial.print("HTTP Response: ");
  Serial.println(httpResponseCode);

  http.end();
  delay(5000);
}