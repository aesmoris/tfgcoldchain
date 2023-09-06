#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

#define DHTTYPE DHT11   // DHT 11

const char* ssid = "WIFI_MESH_34C8";  // Introduce tu SSID
const char* password = "XxStsdECFTADc9";  // Introduce la password

ESP8266WebServer server(80);

unsigned long lastUpdateTime = 0;
const unsigned long updateInterval = 30000; // Intervalo de actualización en milisegundos (30 segundos)


// DHT Sensor
uint8_t DHTPin = 2; //D4 = GPIO2 
               
// Inicializo DHT sensor.
DHT dht(DHTPin, DHTTYPE);                

float Temperature;
float Humidity;
 
void setup() {
  Serial.begin(9600);
  delay(1000);
  
  pinMode(DHTPin, INPUT);

  dht.begin();              

  Serial.println("Conectando a la red ");
  Serial.println(ssid);

  // Conexion a la red wifi
  WiFi.begin(ssid, password);

  // Chequeo si esta conectado a la red wifi
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi conectado correctamente");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // En /data es la ruta donde guardare los datos del handle data
  server.on("/data", handle_Data);

  // Configurar CORS para permitir solicitudes desde cualquier origen
  server.enableCORS(true);
  server.begin();
  Serial.println("Servidor HTTP iniciado");

}
void loop() {
  
  server.handleClient();

  // Verificar si ha pasado el tiempo suficiente para una nueva actualización
  unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime >= updateInterval) {
    // Guardo los valores de temperatura y humedad
    Temperature = dht.readTemperature();
    Humidity = dht.readHumidity();
    
    // Actualizar el tiempo de la última actualización
    lastUpdateTime = currentTime;
  }
}

void handle_Data() {
  // Create a JSON document
  StaticJsonDocument<200> doc;

  // Convierto a int la temperatura
  int TemperatureInt = static_cast<int>(Temperature);

  // Creo el documento JSON con la temperatura y humedad
  doc["temperature"] = TemperatureInt;
  doc["humidity"] = Humidity;

  // Serializo el JSON a char array
  char buffer[200];
  size_t len = serializeJson(doc, buffer);

  // Envio JSON data como respuesta
  server.send(200, "application/json", buffer, len);
}