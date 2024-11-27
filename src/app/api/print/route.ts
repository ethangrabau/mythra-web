import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageName } = body;

    if (!imageName) {
      return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }

    return new Promise((resolve, reject) => {
      // Spawn the Python process
      const process = spawn('python3', ['printservice.py', imageName]);

      process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('Python script executed successfully');
          resolve(
            NextResponse.json({ status: 'Print job started successfully' }, { status: 200 })
          );
        } else {
          console.error(`Python script exited with code ${code}`);
          reject(NextResponse.json({ error: 'Python script execution failed' }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error('Error executing print job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
