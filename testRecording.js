import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Output directory for audio chunks
const outputDir = './test-chunks';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

let chunkIndex = 0;
let recordingProcess = null;

// Function to start recording
const startRecording = () => {
  console.log('Starting recording...');

  const recordChunk = () => {
    const filename = `${outputDir}/chunk-${chunkIndex++}.webm`;

    recordingProcess = ffmpeg()
      .input(':0') // Use MacBook Pro Microphone (audio device [0])
      .inputFormat('avfoundation') // Specify AVFoundation for macOS
      .audioCodec('libopus') // Use opus codec for better compatibility with webm
      .format('webm') // Output format
      .duration(10) // Record for 10 seconds per chunk
      .on('start', (cmd) => {
        console.log(`Recording chunk ${chunkIndex} started with command: ${cmd}`);
      })
      .on('end', () => {
        console.log(`Chunk ${chunkIndex - 1} recording completed.`);
        if (chunkIndex < 3) {
          recordChunk(); // Start the next chunk if under 3 chunks
        } else {
          console.log('Recording completed after 3 chunks.');
        }
      })
      .on('error', (err) => {
        console.error(`Error during recording chunk ${chunkIndex - 1}:`, err.message);
      })
      .save(filename); // Save the chunk to a file
  };

  // Start recording the first chunk
  recordChunk();

  // Stop entire recording process after 30 seconds
  setTimeout(() => {
    if (recordingProcess) {
      recordingProcess.kill('SIGINT');
      console.log('Stopped recording after 30 seconds.');
    }
  }, 30000);
};

// Run the recording function
startRecording();
