import WebSocket from 'ws';

const socket = new WebSocket('ws://localhost:8080');

socket.on('open', () => {
  console.log('Connected to WebSocket server');
  socket.send('Hello Server!');
});

socket.on('message', (data) => {
  console.log('Received:', data);
});

socket.on('close', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
