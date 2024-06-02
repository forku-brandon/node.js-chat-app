const express = require('express')
const webserver = express()
  .use((req, res) =>
    res.sendFile('/node.html', { root: __dirname })
  )
  .listen(3000, () => console.log(`Listening on ${3000}`))

const { WebSocketServer } = require('ws')
const sockserver = new WebSocketServer({ port: 8080 })

// Map to store client IDs and their corresponding WebSocket connections
const clients = new Map();

sockserver.on('connection', (ws, req) => {
  console.log('New client connected!')

  // Generate a unique client ID
  const clientId = generateUniqueId();
  clients.set(clientId, ws);

  // Send the client ID to the newly connected client
  ws.send(JSON.stringify({ type: 'init', clientId }));

  ws.on('close', () => {
    console.log('Client has disconnected!');
    clients.delete(clientId);
  });

  ws.on('message', (data) => {
    try {
      const { type, message, targetClientId, name } = JSON.parse(data);
      console.log(`Received message: ${message}`);

      if (type === 'private') {
        // Send the message to the targeted client
        const targetClient = clients.get(targetClientId);
        if (targetClient) {
          targetClient.send(JSON.stringify({ type: 'private', message, clientId }));
        } else {
          console.log(`Target client ${targetClientId} not found`);
        }
      } else {
        console.log('Unknown message type');
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.onerror = function () {
    console.log('WebSocket error');
  };
});


// Array of unique 4-letter IDs
const uniqueIds = [
  'bless', 'roy', 'randy', 'emelda', 'fritz', 'lydiana', 'titacho'
];

let currentIndex = 0;

function generateUniqueId() {
  if (currentIndex >= uniqueIds.length) {
    // Reset the index if we've used up all the unique IDs
    currentIndex = 0;
  }

  const uniqueId = uniqueIds[currentIndex];
  currentIndex++;

  console.log(" client id :" + uniqueId);
  return uniqueId;
}
