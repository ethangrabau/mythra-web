import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectToDatabase } from '../dbSeederConnect.js';
import { Campaign } from '../../models/Campaign.js';
import { Session } from '../../models/Session.js';
import { Player } from '../../models/Player.js';
import { Character } from '../../models/Character.js';
import { Quest } from '../../models/Quest.js';
import { Transcription } from '@/lib/models/Transcription.js';
import { Location } from '@/lib/models/Location.js';
import mongoose from 'mongoose';

import { createPlayers } from './createPlayers.js';
import { createCharacters } from './createCharacters.js';
import { createCampaigns } from './createCampaigns.js';
import { createQuests } from './createQuests.js';
import { createSessions } from './createSessions.js';
import { createTranscriptions } from './createTranscription.js';
import { createLocations } from './createLocations.js';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('Current directory:', __dirname);
dotenv.config({ path: path.join(__dirname, '../../../../.env.local') });

// Log all environment variables (be careful with sensitive info)
console.log('Loaded environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Found' : 'Not found',
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD,
});

async function clearDatabase() {
  await Promise.all([
    Campaign.deleteMany({}),
    Session.deleteMany({}),
    Player.deleteMany({}),
    Character.deleteMany({}),
    Quest.deleteMany({}),
    Transcription.deleteMany({}),
    Location.deleteMany({}),
  ]);
  console.log('Cleared db data. Ready to seed!');
}

async function seedDatabase() {
  try {
    validateEnvironment();
    await connectToDatabase();
    await clearDatabase();

    // Create all entities
    const players = await createPlayers();
    const characters = await createCharacters(players);
    const campaigns = await createCampaigns(players, characters);
    const quests = await createQuests(campaigns.map(c => c._id));
    const locations = await createLocations(campaigns, quests);

    //Update campaigns with quests
    await updateCampaignQuests(campaigns, quests);

    // Update campaigns with locations
    await updateCampaignLocations(campaigns, locations);

    // Create sessions
    const allSessions = await createSessions(campaigns, characters, quests);

    // Update campaigns with sessions
    await updateCampaignSessions(campaigns, allSessions);
    // const strahdsSessions = allSessions.filter((session: any) => campaigns[0]._id.equals(session.campaignId));
    // const giantsSessions = allSessions.filter((session: any) => campaigns[1]._id.equals(session.campaignId));
    // // Update campaigns with sessions
    // await updateCampaignSessions(campaigns, strahdsSessions, giantsSessions);

    const transcriptions = await createTranscriptions(allSessions, players);
    //Link transcriptions to sessions
    await linkTranscriptionsToSessions(allSessions, transcriptions);

    console.log('✅ Database seeded successfully!');

    // Optional: Return the created objects for testing
    return {
      players,
      characters,
      campaigns,
      quests,
      allSessions,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

function validateEnvironment() {
  const required = ['MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.log(`- ${key}`));
    console.log('\nMake sure you have a .env.local file with these variables.');
    process.exit(1);
  }
}

// Use ES modules syntax for direct execution check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Running seeder...');
  seedDatabase()
    .then(() => {
      console.log('Seeding complete!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

async function updateCampaignQuests(campaigns: any, quests: any) {
  const [firstCampaign, secondCampaign] = campaigns;

  // First campaign quest updates (2 completed, 1 in_progress)
  firstCampaign.quests.mainQuests.push(quests[0]._id, quests[1]._id, quests[2]._id);
  firstCampaign.quests.completedQuests.push(quests[0]._id, quests[1]._id);
  firstCampaign.quests.activeQuests.push(quests[2]._id);
  await firstCampaign.save();

  // Second campaign quest updates (1 failed, 1 completed, 1 not_started)
  secondCampaign.quests.mainQuests.push(quests[3]._id, quests[4]._id, quests[5]._id);
  secondCampaign.quests.failedQuests.push(quests[3]._id);
  secondCampaign.quests.completedQuests.push(quests[4]._id);
  // quests[5] is not_started, so we don't add it to any status arrays
  await secondCampaign.save();

  console.log('🏹 Updated campaign quests');
}

async function updateCampaignLocations(campaigns: any, locations: any) {
  for (const campaign of campaigns) {
    //Find locations associated with this campaign
    const campaignLocations = locations.filter((location: any) =>
      location.campaigns.some((cId: any) => cId.equals(campaign._id))
    );

    //Assign location Ids to the campaign's locations property
    campaign.locations = campaignLocations.map((location: any) => location._id);

    await campaign.save();
  }

  console.log('📍 Updated campaign locations');
}

async function updateCampaignSessions(campaigns: any, allSessions: any) {
  for (const campaign of campaigns) {
    //Find sessions associated with this campaign
    const campaignSessions = allSessions.filter((session: any) => session.campaignId.equals(campaign._id));

    //Assign session Ids to the campaign's sessions.pastSessions property
    campaign.sessions.pastSessions = campaignSessions.map((session: any) => session._id);

    await campaign.save();
  }
  console.log('📅 Updated campaign sessions');
}
// async function updateCampaignSessions(campaigns: any, strahdsSessions: any, giantsSessions: any) {
//   campaigns[0].sessions.pastSessions = strahdsSessions.map((s: any) => s._id);
//   campaigns[1].sessions.pastSessions = giantsSessions.map((s: any) => s._id);

//   await Promise.all(campaigns.map((c: any) => c.save()));
//   console.log('📅 Updated campaign sessions');
// }

async function linkTranscriptionsToSessions(sessions: any, transcriptions: any) {
  for (const session of sessions) {
    //Get only the transcriptions that have a sesionId in our sessions
    const sessionTranscriptions = transcriptions.filter((t: any) => t.sessionId.equals(session._id));
    session.transcriptions = sessionTranscriptions.map((t: any) => t._id);

    await session.save();
  }
}

export default seedDatabase;
