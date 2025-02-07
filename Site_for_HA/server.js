const express = require('express');
const mqtt = require('mqtt');
const app = express();

// Datele serverului MQTT
const mqtt_server = 'test.mosquitto.org';
const mqtt_client_id = 'WebClientDorin';

// Topic-urile MQTT
const topic_control = 'topic/control';
const topic_date = 'topic/date';

const client = mqtt.connect(`mqtt://${mqtt_server}`, { clientId: mqtt_client_id });

client.on('connect', () => {
  console.log('Conectat la MQTT (Backend)!');
  client.subscribe(topic_date); // Abonare la topicul de date
});

client.on('message', (topic, message) => {
  if (topic === topic_date) {
    const receivedValue = message.toString();
    console.log('Date primite de la ESP32:', receivedValue);
    // Actualizează interfața web cu datele primite
    lastReceivedData = receivedValue; // Stocăm ultimele date primite
  }
});

client.on('error', (error) => {
  console.error('Eroare MQTT:', error);
});

client.on('close', () => {
  console.log('Conexiunea MQTT a fost închisă.');
});

let lastReceivedData = ""; 

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Control ESP32</title>
    </head>
    <body>
      <h1>Control Releu</h1>
      <button onclick="sendCommand('aprinde')">Aprinde Releu</button>
      <button onclick="sendCommand('stinge')">Stinge Releu</button>
      <div id="date-esp32"></div>

      <script>
        // Nu mai avem o a doua conexiune MQTT în frontend!

        function sendCommand(command) {
          fetch('/sendCommand', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'command=' + command,
          })
          .then(response => response.text())
          .then(data => console.log(data));
        }

        function updateData() {
          fetch('/data')
            .then(response => response.text())
            .then(data => {
              document.getElementById('date-esp32').innerText = 'Date ESP32: ' + data;
            });
        }

        setInterval(updateData, 5000); // Actualizează datele la fiecare 5 secunde
      </script>
    </body>
    </html>
  `);
});

app.post('/sendCommand', express.urlencoded({ extended: true }), (req, res) => {
  if(client.connected) {
  const command = req.body.command;
  client.publish(topic_control, command);
  console.log('Comanda trimisă:', command);
  res.send('Comanda trimisă!');
  } else {
      console.error('Clientul MQTT nu este conectat.');
      res.status(500).send('Eroare: Clientul MQTT nu este conectat.');
    }
});

app.get('/data', (req, res) => {
  res.send(lastReceivedData); // Trimite ultimele date primite la frontend
});

app.listen(3000, () => {
  console.log('Server web pornit pe portul 3000!');
});