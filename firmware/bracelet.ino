// ============================================================
// OMNITRIX — Bracelet d'alerte (ESP8266)
// Envoie les alertes directement à Supabase via HTTPS
//
// Librairies requises (Gestionnaire de bibliothèques Arduino) :
//   - ESP8266WiFi       (incluse avec esp8266 board)
//   - ESP8266HTTPClient (incluse avec esp8266 board)
//   - TinyGPS++         (par Mikal Hart)
//
// Board : NodeMCU 1.0 (ESP-12E Module) ou Wemos D1 Mini
// ============================================================

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>

// ── À CONFIGURER ────────────────────────────────────────────
const char* WIFI_SSID      = "VOTRE_WIFI";
const char* WIFI_PASSWORD  = "VOTRE_MOT_DE_PASSE";
const char* SUPABASE_HOST  = "otnqywilrooprsfcfvnx.supabase.co";
const char* SUPABASE_KEY   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnF5d2lscm9vcHJzZmNmdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjY2NzQsImV4cCI6MjA5NjE0MjY3NH0.EJh8AqUmTHad7jaYeJZ-zszt7yjTWo7_Dgruhzl_Nc0";
const char* NUMERO_SERIE   = "BR-001";   // ← changer par bracelet
// ────────────────────────────────────────────────────────────

// ── Pins boutons (INPUT_PULLUP → LOW = appuyé) ───────────────
#define PIN_BTN_MEDECIN D1   // Bouton jaune
#define PIN_BTN_POMPIER D2   // Bouton rouge
#define PIN_BTN_POLICE  D3   // Bouton bleu

// ── Pins LEDs ────────────────────────────────────────────────
#define PIN_LED_MEDECIN D5
#define PIN_LED_POMPIER D6
#define PIN_LED_POLICE  D7
#define PIN_LED_WIFI    D8   // Allumée = WiFi connecté

// ── GPS sur SoftwareSerial (RX=D4, TX=D0) ───────────────────
SoftwareSerial gpsSerial(D4, D0);
TinyGPSPlus    gps;

// ── Variables globales ───────────────────────────────────────
double   g_lat        = 0.0;
double   g_lng        = 0.0;
bool     g_gpsValide  = false;
uint32_t g_dernierEnvoi = 0;
const uint32_t DEBOUNCE_MS = 3000;   // 3s min entre deux alertes

// ────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  Serial.println("\n=== OMNITRIX Bracelet démarrage ===");

  // Boutons
  pinMode(PIN_BTN_MEDECIN, INPUT_PULLUP);
  pinMode(PIN_BTN_POMPIER, INPUT_PULLUP);
  pinMode(PIN_BTN_POLICE,  INPUT_PULLUP);

  // LEDs
  pinMode(PIN_LED_MEDECIN, OUTPUT);
  pinMode(PIN_LED_POMPIER, OUTPUT);
  pinMode(PIN_LED_POLICE,  OUTPUT);
  pinMode(PIN_LED_WIFI,    OUTPUT);

  // Test LEDs au démarrage
  for (int i = 0; i < 2; i++) {
    digitalWrite(PIN_LED_MEDECIN, HIGH); delay(100);
    digitalWrite(PIN_LED_POMPIER, HIGH); delay(100);
    digitalWrite(PIN_LED_POLICE,  HIGH); delay(100);
    digitalWrite(PIN_LED_MEDECIN, LOW);
    digitalWrite(PIN_LED_POMPIER, LOW);
    digitalWrite(PIN_LED_POLICE,  LOW);
    delay(200);
  }

  connecterWifi();
}

// ────────────────────────────────────────────────────────────
void loop() {
  // Lire les données GPS en continu
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid() && gps.location.age() < 2000) {
        g_lat       = gps.location.lat();
        g_lng       = gps.location.lng();
        g_gpsValide = true;
      }
    }
  }

  // Reconnecter le WiFi si perdu
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_LED_WIFI, LOW);
    connecterWifi();
  }

  // Lire les boutons (debounce global)
  uint32_t maintenant = millis();
  if (maintenant - g_dernierEnvoi > DEBOUNCE_MS) {
    if (digitalRead(PIN_BTN_MEDECIN) == LOW) {
      envoyerAlerte("medecin", PIN_LED_MEDECIN);
      g_dernierEnvoi = millis();
    } else if (digitalRead(PIN_BTN_POMPIER) == LOW) {
      envoyerAlerte("pompier", PIN_LED_POMPIER);
      g_dernierEnvoi = millis();
    } else if (digitalRead(PIN_BTN_POLICE) == LOW) {
      envoyerAlerte("police", PIN_LED_POLICE);
      g_dernierEnvoi = millis();
    }
  }
}

// ────────────────────────────────────────────────────────────
void connecterWifi() {
  Serial.print("Connexion WiFi '" + String(WIFI_SSID) + "' ...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int tentatives = 0;
  while (WiFi.status() != WL_CONNECTED && tentatives < 20) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_LED_WIFI, !digitalRead(PIN_LED_WIFI));
    tentatives++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK ! IP: " + WiFi.localIP().toString());
    digitalWrite(PIN_LED_WIFI, HIGH);
  } else {
    Serial.println(" ECHEC (pas de WiFi)");
    digitalWrite(PIN_LED_WIFI, LOW);
  }
}

// ────────────────────────────────────────────────────────────
void envoyerAlerte(const char* type, int pinLed) {
  Serial.println("--- Alerte: " + String(type) + " ---");
  if (g_gpsValide) {
    Serial.println("GPS: " + String(g_lat, 6) + ", " + String(g_lng, 6));
  } else {
    Serial.println("GPS: pas de signal");
  }

  // Feedback LED immédiat (allumer pendant l'envoi)
  digitalWrite(pinLed, HIGH);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Pas de WiFi — alerte non envoyée");
    clignoterErreur(pinLed);
    return;
  }

  // ── Construire le JSON ───────────────────────────────────
  int batterie = lireBatterie();
  String body = "{";
  body += "\"p_numero_serie\":\"" + String(NUMERO_SERIE) + "\",";
  body += "\"p_type\":\"" + String(type) + "\"";
  if (g_gpsValide) {
    body += ",\"p_lat\":" + String(g_lat, 6);
    body += ",\"p_lng\":" + String(g_lng, 6);
  }
  body += ",\"p_batterie\":" + String(batterie);
  body += "}";
  Serial.println("Payload: " + body);

  // ── Appel HTTPS → Supabase RPC ───────────────────────────
  WiFiClientSecure client;
  client.setInsecure();   // Pas de validation certificat (OK pour développement)
  client.setTimeout(10);

  HTTPClient http;
  String url = "https://" + String(SUPABASE_HOST) + "/rest/v1/rpc/envoyer_alerte";
  http.begin(client, url);
  http.addHeader("Content-Type",  "application/json");
  http.addHeader("apikey",        SUPABASE_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_KEY));

  int httpCode = http.POST(body);
  String reponse = http.getString();
  http.end();

  Serial.println("HTTP " + String(httpCode) + ": " + reponse);

  // ── Feedback LED selon résultat ──────────────────────────
  if (httpCode == 200) {
    // Succès : 3 clignotements lents
    for (int i = 0; i < 3; i++) {
      digitalWrite(pinLed, LOW);  delay(200);
      digitalWrite(pinLed, HIGH); delay(200);
    }
  } else {
    clignoterErreur(pinLed);
  }
  digitalWrite(pinLed, LOW);
}

// ────────────────────────────────────────────────────────────
int lireBatterie() {
  // A0 = tension batterie via diviseur résistif
  // Adapter les valeurs min/max à ton montage électronique
  int val = analogRead(A0);
  return map(val, 0, 1023, 0, 100);
}

void clignoterErreur(int pinLed) {
  // Clignotement rapide = erreur
  for (int i = 0; i < 8; i++) {
    digitalWrite(pinLed, !digitalRead(pinLed));
    delay(80);
  }
  digitalWrite(pinLed, LOW);
}
