// src/app/api/socket/route.ts
import { NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';

const globalForIO = global as { io?: SocketIOServer };

export async function GET() {
  console.log('WebSocket route handler called');
  
  if (!globalForIO.io) {
    console.log('Creating new Socket.IO server');
    
    const io = new SocketIOServer({
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      path: '/api/socket'
    });

    globalForIO.io = io;
    console.log('Socket.IO server created');

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('audioChunk', (chunk: ArrayBuffer) => {
        console.log('Received audio chunk of size:', chunk.byteLength);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  } else {
    console.log('Socket.IO server already exists');
  }

  return new NextResponse('WebSocket server is running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
    },
  });
}