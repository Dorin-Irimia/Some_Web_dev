const express = require('express');
const app = express();
const WebSocket = require('ws');

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server pornit pe portul ${server.address().port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client conectat');

  ws.on('message', message => {
    console.log(`Mesaj primit: ${message}`);

    // Redirecționează mesajul către toți clienții conectați (inclusiv ESP32)
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client deconectat');
  });
});

app.get('/', (req, res) => {
  res.send('Server WebSocket activ!      Verificare verifica conexiunea cu ESP-ul');
});