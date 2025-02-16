// server.js (Node.js/Express backend)
const express = require('express');
const mqtt = require('mqtt');
const app = express();
const fs = require('fs');

// MQTT Configuration
const mqtt_server = 'test.mosquitto.org';
const mqtt_client_id = 'WebClientDorin';
const topic_control = 'topic/control';
const topic_date = 'topic/date';
const topic_data_work_mode = 'topic/date_work_mode';
const topic_data_clock_stored = 'topic/date_clock_stored';
const topic_work_mode = 'topic/work_mode';
const topic_clock_start = 'topic/clock_start';
const topic_clock_stop = 'topic/clock_stop';


const client = mqtt.connect(`mqtt://${mqtt_server}`, { clientId: mqtt_client_id });

client.on('connect', () => {
  console.log('Connected to MQTT (Backend)!');
  client.subscribe(topic_date);
  client.subscribe(topic_data_work_mode);
  client.subscribe(topic_data_clock_stored);
});

client.on('message', (topic, message) => {
  if (topic === topic_date) {
    const receivedValue = message.toString();
    console.log('Data received from ESP32:', receivedValue);
    lastReceivedData = receivedValue;
  }
  
  if (topic === topic_data_work_mode) {
    const receivedValue = message.toString();
    console.log('Modul de lucru setat este: ', receivedValue);
    lastReceivedDataWorkspace = receivedValue;
  }
  if (topic === topic_data_clock_stored) {
    const clockValue = message.toString();
    console.log('Intervalul orar este: ', clockValue);
    lastReceivedDataClockStored = clockValue;
  }
  
});

client.on('error', (error) => {
  console.error('MQTT Error:', error);
});

client.on('close', () => {
  console.log('MQTT connection closed.');
});

let lastReceivedData = "";
let lastReceivedDataWorkspace = "";
let lastReceivedDataClockStored = "";


app.use(express.urlencoded({ extended: true })); // Middleware for parsing form data

app.post('/sendCommand', (req, res) => {
  if (client.connected) {
    const command = req.body.command;
    client.publish(topic_control, command);
    console.log('Command sent:', command);
    res.send('Command sent!');
  } else {
    console.error('MQTT client is not connected.');
    res.status(500).send('Error: MQTT client is not connected.');
  }
});

app.post('/sendWorkMode', (req, res) => {

  if (client.connected) {
    const command = req.body.command;
    client.publish(topic_work_mode, command, (err) => {
    if (err) {
        console.error("MQTT Publish Error:", err);
        res.status(500).send("Error sending command to MQTT"); 
      } else {
        console.log('Command sent:', command);
        res.send(`WorkMode is now ${command === 'AUTO'? 'AUTO': 'MANUAL'}`); 
      }
    });
  } else {
    console.error('MQTT client is not connected.');
    res.status(500).send('Error: MQTT client is not connected.');
  }
});


app.get('/data', (req, res) => {
  res.send(lastReceivedData);
});

app.get('/date', (req, res) => {
  res.send(lastReceivedDataWorkspace);
});

app.get('/dateClock', (req, res) => {
   res.send(lastReceivedDataClockStored);
});

app.post('/sendClockStorageStart', (req, res) => {
  if (client.connected) {
    const command = req.body.command;
    client.publish(topic_clock_start, command);
    console.log('Command sent:', command);
    res.send('Command sent!');
  } else {
    console.error('MQTT client is not connected.');
    res.status(500).send('Error: MQTT client is not connected.');
  }
}); 

app.post('/sendClockStorageStop', (req, res) => {
  if (client.connected) {
    const command = req.body.command;
    client.publish(topic_clock_stop, command);
    console.log('Command sent:', command);
    res.send('Command sent!');
  } else {
    console.error('MQTT client is not connected.');
    res.status(500).send('Error: MQTT client is not connected.');
  }
}); 

// Serve static files from the 'public' directory
app.use(express.static('public'));


app.listen(3000, () => {
  console.log('Web server started on port 3000!');
});