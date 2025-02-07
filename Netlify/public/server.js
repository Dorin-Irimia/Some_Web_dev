const express = require('express');
const mqtt = require('mqtt');
const app = express();

// Datele serverului MQTT (folosește un broker public sau propriul tău)
const mqtt_server = 'test.mosquitto.org'; // Sau adresa ta
const mqtt_client_id = 'WebClientDorin'; // Generează un ID unic pentru fiecare client

// Topic-urile MQTT
const topic_control = 'topic/control';
const topic_date = 'topic/status';

const client = mqtt.connect(`mqtt://${mqtt_server}`, { clientId: mqtt_client_id });

client.on('connect', () => {
  console.log('Conectat la MQTT (Backend)!');
  client.subscribe(topic_date);
});

client.on('message', (topic, message) => {
  if (topic === topic_date) {
    const receivedValue = message.toString();
    console.log('Date primite de la ESP32:', receivedValue);
    lastReceivedData = receivedValue;
  }
});

client.on('error', (error) => {
  console.error('Eroare MQTT:', error);
});

client.on('close', () => {
  console.log('Conexiunea MQTT a fost închisă.');
});

let lastReceivedData = "";

app.use(express.json()); // Important pentru a parsa body-ul cererilor POST

app.post('/.netlify/functions/sendCommand', (req, res) => { // Ruta pentru Netlify Function
  const command = req.body.command;
  client.publish(topic_control, command);
  console.log('Comanda trimisă:', command);
  res.status(200).json({ message: 'Comanda trimisă!' }); // Trimite un răspuns JSON
});

app.get('/.netlify/functions/data', (req, res) => { // Ruta pentru Netlify Function
  res.status(200).json({ data: lastReceivedData }); // Trimite datele ca JSON
});

// Nu mai avem nevoie de app.listen() aici, Netlify o va gestiona

module.exports.handler = async (event, context) => { // Handler pentru Netlify Functions
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Serverless function started" }), // Un mesaj inițial (poți să-l schimbi)
  };
};