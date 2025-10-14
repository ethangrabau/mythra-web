import fs from 'fs';
import path from 'path';

class CampaignManager {
  constructor(baseDir = 'metadata/campaigns') {
    this.baseDir = baseDir;
    this.ensureDirectory(baseDir);
  }

  ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Normalize campaign name for filesystem
  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  // Get all campaigns
  listCampaigns() {
    try {
      const campaigns = [];
      const dirs = fs.readdirSync(this.baseDir);
      
      for (const dir of dirs) {
        const campaignPath = path.join(this.baseDir, dir);
        const metadataPath = path.join(campaignPath, 'metadata.json');
        
        if (fs.statSync(campaignPath).isDirectory() && fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          campaigns.push({
            id: dir,
            ...metadata
          });
        }
      }
      
      return campaigns.sort((a, b) => b.lastPlayed - a.lastPlayed);
    } catch (err) {
      console.error('Error listing campaigns:', err);
      return [];
    }
  }

  // Create a new campaign
  createCampaign(name, description = '') {
    const id = this.normalizeName(name);
    const campaignPath = path.join(this.baseDir, id);
    
    // Check if already exists
    if (fs.existsSync(campaignPath)) {
      return { error: 'Campaign already exists', id };
    }
    
    // Create campaign directory structure
    this.ensureDirectory(campaignPath);
    this.ensureDirectory(path.join(campaignPath, 'transcriptions'));
    this.ensureDirectory(path.join('generated_images', id));
    
    // Create metadata
    const metadata = {
      name,
      description,
      id,
      created: Date.now(),
      lastPlayed: Date.now(),
      sessions: []
    };
    
    fs.writeFileSync(
      path.join(campaignPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create initial empty memory
    const memory = {
      characters: [],
      items: [],
      locations: []
    };
    
    fs.writeFileSync(
      path.join(campaignPath, 'memory.json'),
      JSON.stringify(memory, null, 2)
    );
    
    console.log(`Campaign created: ${name} (${id})`);
    return { success: true, id, metadata };
  }

  // Load campaign memory
  loadCampaignMemory(campaignId) {
    const memoryPath = path.join(this.baseDir, campaignId, 'memory.json');
    
    try {
      if (fs.existsSync(memoryPath)) {
        const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf-8'));
        console.log(`Loaded memory for campaign: ${campaignId}`);
        return memory;
      }
    } catch (err) {
      console.error('Error loading campaign memory:', err);
    }
    
    // Return empty memory if not found
    return {
      characters: [],
      items: [],
      locations: []
    };
  }

  // Save campaign memory
  saveCampaignMemory(campaignId, memory) {
    const memoryPath = path.join(this.baseDir, campaignId, 'memory.json');
    
    try {
      // Ensure campaign directory exists
      const campaignPath = path.join(this.baseDir, campaignId);
      this.ensureDirectory(campaignPath);
      
      fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
      console.log(`Saved memory for campaign: ${campaignId}`);
      
      // Update last played timestamp
      this.updateCampaignMetadata(campaignId, { lastPlayed: Date.now() });
      
      return true;
    } catch (err) {
      console.error('Error saving campaign memory:', err);
      return false;
    }
  }

  // Add session to campaign
  addSessionToCampaign(campaignId, sessionId, transcriptionData) {
    const campaignPath = path.join(this.baseDir, campaignId);
    const transcriptionsPath = path.join(campaignPath, 'transcriptions');
    
    try {
      // Save transcription
      this.ensureDirectory(transcriptionsPath);
      const sessionFile = path.join(transcriptionsPath, `session-${sessionId}.json`);
      fs.writeFileSync(sessionFile, JSON.stringify(transcriptionData, null, 2));
      
      // Update metadata
      const metadataPath = path.join(campaignPath, 'metadata.json');
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      
      if (!metadata.sessions) metadata.sessions = [];
      metadata.sessions.push({
        id: sessionId,
        timestamp: Date.now(),
        transcriptionCount: transcriptionData.transcriptions?.length || 0
      });
      metadata.lastPlayed = Date.now();
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      return true;
    } catch (err) {
      console.error('Error adding session to campaign:', err);
      return false;
    }
  }

  // Get campaign sessions
  getCampaignSessions(campaignId) {
    const transcriptionsPath = path.join(this.baseDir, campaignId, 'transcriptions');
    
    try {
      if (!fs.existsSync(transcriptionsPath)) return [];
      
      const files = fs.readdirSync(transcriptionsPath);
      const sessions = [];
      
      for (const file of files) {
        if (file.startsWith('session-') && file.endsWith('.json')) {
          const sessionData = JSON.parse(
            fs.readFileSync(path.join(transcriptionsPath, file), 'utf-8')
          );
          sessions.push({
            filename: file,
            sessionId: sessionData.sessionId,
            transcriptions: sessionData.transcriptions || []
          });
        }
      }
      
      return sessions;
    } catch (err) {
      console.error('Error getting campaign sessions:', err);
      return [];
    }
  }

  // Update campaign metadata
  updateCampaignMetadata(campaignId, updates) {
    const metadataPath = path.join(this.baseDir, campaignId, 'metadata.json');
    
    try {
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const updated = { ...metadata, ...updates };
        fs.writeFileSync(metadataPath, JSON.stringify(updated, null, 2));
        return true;
      }
    } catch (err) {
      console.error('Error updating campaign metadata:', err);
    }
    
    return false;
  }

  // Delete campaign (be careful!)
  deleteCampaign(campaignId) {
    const campaignPath = path.join(this.baseDir, campaignId);
    
    try {
      if (fs.existsSync(campaignPath)) {
        fs.rmSync(campaignPath, { recursive: true });
        
        // Also remove images
        const imagesPath = path.join('generated_images', campaignId);
        if (fs.existsSync(imagesPath)) {
          fs.rmSync(imagesPath, { recursive: true });
        }
        
        console.log(`Deleted campaign: ${campaignId}`);
        return true;
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
    
    return false;
  }
}

export default CampaignManager;