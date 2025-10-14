import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { generateMemoryPrompt } from './src/lib/services/memoryPrompt.js';
import { generateImagePrompt } from './src/lib/services/generateImagePrompt.js';
import { generateImageFlux } from './src/lib/services/generateImageFlux.js';
import { normalizeSessionId } from './src/lib/utils/session.js';
import { applyPatch } from './src/lib/memory/merge.js';
import CampaignManager from './src/lib/services/campaignManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI();

// File paths
const transcriptionDir = path.join(__dirname, 'metadata');
const memoryFilePath = path.join(transcriptionDir, 'memory-log.txt'); // Legacy path
const imagesDirPath = path.join(__dirname, 'generated_images');

// Campaign manager
const campaignManager = new CampaignManager();
let currentCampaignId = null;

// Callback for image generation
let onImageGenerated = null;

// Rate limiting for image generation
let lastImageGenerationTime = 0;
const IMAGE_GENERATION_COOLDOWN = 60000; // 60 seconds in milliseconds

// Ensure required directories exist
if (!fs.existsSync(transcriptionDir)) {
  fs.mkdirSync(transcriptionDir, { recursive: true });
}
if (!fs.existsSync(imagesDirPath)) {
  fs.mkdirSync(imagesDirPath);
}

// Memory structure
let memory = {
  characters: [],
  items: [],
  locations: [],
};

// Set the active campaign for this file watcher session
export const setActiveCampaign = (campaignId) => {
  currentCampaignId = campaignId;
  console.log('File watcher: Active campaign set to:', campaignId);
  
  // Load campaign-specific memory
  if (campaignId) {
    memory = campaignManager.loadCampaignMemory(campaignId);
    console.log('Loaded campaign memory:', memory);
  } else {
    // Use default/legacy memory if no campaign
    loadMemory();
  }
};

// Track processed chunks by session
//const processedChunks = new Map(); // sessionId -> Set of processed chunkIds

// Add new reset function
export const resetMemory = () => {
  console.log('Resetting memory state...');
  memory = {
    characters: [],
    items: [],
    locations: [],
  };
  
  if (currentCampaignId) {
    // Save to campaign-specific memory
    campaignManager.saveCampaignMemory(currentCampaignId, memory);
  } else {
    // Save to legacy location
    saveMemory(JSON.stringify(memory, null, 2));
  }
  
  console.log('Memory reset completed');
};

// Load memory
const loadMemory = () => {
  try {
    if (fs.existsSync(memoryFilePath)) {
      const data = fs.readFileSync(memoryFilePath, 'utf-8');
      memory = JSON.parse(data);
      console.log('Memory loaded:', memory);
    } else {
      // Initialize empty memory file if it doesn't exist
      const initialMemory = {
        characters: [],
        items: [],
        locations: [],
      };
      saveMemory(JSON.stringify(initialMemory, null, 2));
      memory = initialMemory;
      console.log('Created new memory file with initial state');
    }
  } catch (err) {
    console.error('Error loading memory, starting fresh:', err);
    memory = {
      characters: [],
      items: [],
      locations: [],
    };
  }
};

// Updated saveMemory function
const saveMemory = (memoryUpdate) => {
  try {
    // Parse if string
    const memoryObj = typeof memoryUpdate === 'string' 
      ? JSON.parse(memoryUpdate)
      : memoryUpdate;
    
    if (currentCampaignId) {
      // Save to campaign-specific location
      console.log('Saving memory to campaign:', currentCampaignId);
      campaignManager.saveCampaignMemory(currentCampaignId, memoryObj);
    } else {
      // Save to legacy location
      console.log('Saving memory to:', memoryFilePath);
      const contentToWrite = typeof memoryUpdate === 'string' 
        ? memoryUpdate 
        : JSON.stringify(memoryUpdate, null, 2);
      fs.writeFileSync(memoryFilePath, contentToWrite);
    }
    
    console.log('Memory saved successfully');
  } catch (err) {
    console.error('Error saving memory:', err);
    console.error('Error details:', err.message);
  }
};

// Process new transcription with context
const processTranscriptionData = async (transcriptionData) => {
  const { transcriptions, sessionId } = transcriptionData;
  const normalizedSessionId = normalizeSessionId(sessionId);
  
  // Get the latest transcription
  const newTranscription = transcriptions[transcriptions.length - 1];

  if (!newTranscription) return; // Nothing new to process
  
  // Get recent context (last 3 transcriptions before the new one)
  const recentContext = transcriptions
    .slice(-4, -1) // Get up to 3 previous transcriptions
    .map(t => t.text)
    .join(' ');

  console.log('Processing new transcription:', {
    text: newTranscription.text,
    context: recentContext,
    sessionId: normalizedSessionId,
    campaign: currentCampaignId,
  });

  try {
    // 1. Generate image with rate limiting (max 1 per minute)
    const now = Date.now();
    const timeSinceLastImage = now - lastImageGenerationTime;
    
    if (timeSinceLastImage >= IMAGE_GENERATION_COOLDOWN) {
      console.log('Generating image prompt...');
      const imagePrompt = await generateImagePrompt(
        newTranscription.text, 
        recentContext,
        memory
      );
      if (imagePrompt) {
        console.log('Image prompt received:', imagePrompt);
        // Pass campaign ID for organized image storage
        const imagePath = await generateImageFlux(imagePrompt, normalizedSessionId, currentCampaignId);
        if (imagePath) {
          console.log(`Image generated and saved at: ${imagePath}`);
          lastImageGenerationTime = now; // Update last generation time
          // Notify the server about the new image
          if (onImageGenerated) {
            onImageGenerated({
              sessionId: normalizedSessionId,
              imagePath: imagePath,
              timestamp: Date.now()
            });
          }
        }
      }
    } else {
      const remainingCooldown = Math.ceil((IMAGE_GENERATION_COOLDOWN - timeSinceLastImage) / 1000);
      console.log(`Image generation on cooldown. ${remainingCooldown} seconds remaining until next image.`);
    }

    // 2. Update memory after image generation using PATCH mode
    const prompt = generateMemoryPrompt(newTranscription.text, memory, recentContext);
    console.log('Calling LLM for memory patch...');
    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL_MEMORY || 'gpt-4o-mini',
      messages: [{ 
        role: 'user', 
        content: prompt
      }],
      response_format: { type: "json_object" },
      temperature: 0.2,  // Lower temperature for more consistent JSON
      max_tokens: 800    // Patches are much smaller
    });

    const patchResponse = response.choices[0]?.message?.content;
    if (patchResponse) {
      console.log('Received patch:', patchResponse);
      try {
        const patch = JSON.parse(patchResponse);
        
        // Apply the patch to existing memory
        memory = applyPatch(memory, patch);
        
        // Ensure the memory has the required structure
        if (!memory.characters) memory.characters = [];
        if (!memory.items) memory.items = [];
        if (!memory.locations) memory.locations = [];
        
        // Check if patch actually changed anything
        const hasChanges = 
          (patch.characters_upsert?.length > 0) ||
          (patch.items_upsert?.length > 0) ||
          (patch.locations_upsert?.length > 0) ||
          (patch.deletions?.characters?.length > 0) ||
          (patch.deletions?.items?.length > 0) ||
          (patch.deletions?.locations?.length > 0);
        
        if (hasChanges) {
          saveMemory(memory);
          console.log('Memory patched and saved');
        } else {
          console.log('No changes in patch, skipping save');
        }
      } catch (err) {
        console.error('Error parsing patch:', err);
        console.error('Raw response:', patchResponse);
        
        // Retry once with repair prompt
        console.log('Retrying with repair prompt...');
        try {
          const repairResponse = await openai.chat.completions.create({
            model: process.env.LLM_MODEL_MEMORY || 'gpt-4o-mini',
            messages: [{ 
              role: 'user', 
              content: 'You returned invalid JSON. Return only the valid PATCH JSON again:\n' + patchResponse
            }],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 800
          });
          
          const repairedPatch = JSON.parse(repairResponse.choices[0]?.message?.content);
          memory = applyPatch(memory, repairedPatch);
          saveMemory(memory);
          console.log('Memory patched after repair');
        } catch (repairErr) {
          console.error('Repair also failed:', repairErr);
        }
      }
    }
  } catch (error) {
    console.error('Error processing transcription:', error);
  }
};

const startFileWatcher = (imageCallback = null) => {
  // Set the image generation callback
  onImageGenerated = imageCallback;
  
  console.log('Starting file watcher...');
  
  // Load memory based on whether we have a campaign
  if (currentCampaignId) {
    memory = campaignManager.loadCampaignMemory(currentCampaignId);
  } else {
    loadMemory();
  }

  console.log('Watching directory for transcription changes:', transcriptionDir);
  fs.watch(transcriptionDir, (eventType, filename) => {
    if (filename && filename.endsWith('-transcription.json')) {
      const filePath = path.join(transcriptionDir, filename);

      fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
          console.error(`Error reading transcription file ${filename}:`, err);
          return;
        }

        try {
          const transcriptionData = JSON.parse(data);
          if (transcriptionData.transcriptions?.length > 0) {
            await processTranscriptionData(transcriptionData);
            
            // Save transcription to campaign if active
            if (currentCampaignId && transcriptionData.sessionId) {
              campaignManager.addSessionToCampaign(
                currentCampaignId,
                transcriptionData.sessionId,
                transcriptionData
              );
            }
          }
        } catch (err) {
          console.error('Error processing transcription file:', err);
        }
      });
    }
  });
};

export const fileWatcher = {
  start: startFileWatcher,
  resetMemory,
  setActiveCampaign,
  setImageCallback: (callback) => { onImageGenerated = callback; }
};