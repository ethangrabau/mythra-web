import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Current working directory:', process.cwd());
console.log('Looking for .env.local at:', path.resolve(process.cwd(), '.env.local'));

//Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Log all environment variables (be careful with sensitive info)
console.log('Loaded environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Found' : 'Not found',
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD,
});

import dbConnect from '../db';
import { Campaign } from '../models/Campaign';
import { Session } from '../models/Session';
import { Player } from '../models/Player';
import { Character } from '../models/Character';
import { Quest } from '../models/Quest';
import mongoose from 'mongoose';

async function clearDatabase() {
  await Promise.all([
    Campaign.deleteMany({}),
    Session.deleteMany({}),
    Player.deleteMany({}),
    Character.deleteMany({}),
    Quest.deleteMany({}),
  ]);
  console.log('Cleared db data. Ready to seed!');
}

async function seedDatabase() {
  try {
    validateEnvironment();
    await dbConnect();
    await clearDatabase();

    // Create Players
    const players = await Player.create([
      {
        email: 'dm@example.com',
        username: 'EpicDM',
        displayName: 'Dragon Master',
        discord: 'dragonmaster#1234',
        preferredPronouns: 'they/them',
        timezone: 'America/New_York',
        availability: [
          {
            dayOfWeek: 5, // Friday
            startTime: '19:00',
            endTime: '23:00',
          },
        ],
      },
      {
        email: 'player1@example.com',
        username: 'Eldrin',
        displayName: 'Sarah',
        discord: 'eldrin#5678',
        preferredPronouns: 'she/her',
        timezone: 'America/Chicago',
        availability: [
          {
            dayOfWeek: 5,
            startTime: '19:00',
            endTime: '23:00',
          },
        ],
      },
      {
        email: 'player2@example.com',
        username: 'Thorgar',
        displayName: 'Mike',
        discord: 'thorgar#9012',
        preferredPronouns: 'he/him',
        timezone: 'America/Los_Angeles',
        availability: [
          {
            dayOfWeek: 5,
            startTime: '19:00',
            endTime: '23:00',
          },
        ],
      },
    ]);

    console.log('👥 Created players');

    // Create Characters
    const characters = await Character.create([
      {
        playerId: players[1]._id, // Sarah's character
        name: 'Eldrin Silverleaf',
        class: [
          {
            name: 'Wizard',
            level: 5,
            subclass: 'School of Evocation',
          },
        ],
        race: 'High Elf',
        background: 'Sage',
        alignment: 'NG',
        experience: 6500,
        stats: {
          strength: 8,
          dexterity: 14,
          constitution: 12,
          intelligence: 16,
          wisdom: 13,
          charisma: 10,
        },
        personalityTraits: ['Always has their nose in a book'],
        bonds: ['Seeking ancient magical knowledge'],
        ideals: ['Knowledge is power'],
        flaws: ['Overconfident in their abilities'],
        inventory: [
          {
            item: 'Spellbook',
            quantity: 1,
            equipped: true,
            attuned: false,
          },
        ],
      },
      {
        playerId: players[2]._id, // Mike's character
        name: 'Thorgar Ironfist',
        class: [
          {
            name: 'Fighter',
            level: 5,
            subclass: 'Battle Master',
          },
        ],
        race: 'Mountain Dwarf',
        background: 'Soldier',
        alignment: 'LG',
        experience: 6500,
        stats: {
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 10,
          wisdom: 13,
          charisma: 8,
        },
        personalityTraits: ['Never backs down from a challenge'],
        bonds: ['Protect the weak'],
        ideals: ['Honor above all'],
        flaws: ['Too stubborn for their own good'],
        inventory: [
          {
            item: 'Warhammer',
            quantity: 1,
            equipped: true,
            attuned: false,
          },
        ],
      },
    ]);

    console.log('🧙‍♂️ Created characters');

    // Create Campaign
    const campaign = await Campaign.create({
      name: 'The Lost Mines of Phandelver',
      description: 'A D&D 5E adventure for beginning players',
      dmId: players[0]._id, // First player is DM
      players: [
        {
          playerId: players[1]._id,
          characterId: characters[0]._id,
          isActive: true,
          joinDate: new Date(),
        },
        {
          playerId: players[2]._id,
          characterId: characters[1]._id,
          isActive: true,
          joinDate: new Date(),
        },
      ],
      setting: 'Forgotten Realms',
      startDate: new Date(),
      level: {
        start: 1,
        current: 5,
      },
      status: 'active',
      nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      tags: ['beginner-friendly', 'official-campaign'],
      quests: {
        mainQuests: [],
        sideQuests: [],
        characterQuests: [],
        factionQuests: [],
        activeQuests: [],
        completedQuests: [],
        failedQuests: [],
      },
    });

    console.log('📚 Created campaign');

    // Create a Quest
    const quest = await Quest.create({
      campaignId: campaign._id,
      name: 'Clear the Goblin Cave',
      description: 'The party must clear out a cave of goblins who have been raiding caravans',
      type: 'main',
      status: 'completed',
      difficulty: 'medium',
      giver: {
        name: 'Sildar Hallwinter',
        type: 'npc',
        location: 'Phandalin',
      },
      objectives: [
        {
          description: 'Find the goblin cave',
          completed: true,
          optional: false,
        },
        {
          description: 'Defeat the goblin leader',
          completed: true,
          optional: false,
        },
      ],
      rewards: {
        gold: 100,
        experience: 500,
        items: ['Potion of Healing', 'Goblin War Banner'],
      },
    });

    // Update campaign with quest
    campaign.quests.mainQuests.push(quest._id);
    campaign.quests.completedQuests.push(quest._id);
    await campaign.save();

    console.log('📜 Created quest');

    // Create Session
    const session = await Session.create({
      campaignId: campaign._id,
      sessionNumber: 1,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      duration: 240, // 4 hours in minutes
      location: {
        name: 'Roll20',
        isVirtual: true,
        platform: 'Roll20',
      },
      summary: 'The party met in Neverwinter and began their journey to Phandalin',
      combatEncounters: [
        {
          name: 'Goblin Ambush',
          difficulty: 'medium',
          outcome: 'Party defeated 4 goblins and captured one for questioning',
        },
      ],
      questProgress: [
        {
          questId: quest._id,
          previousStatus: 'not_started',
          newStatus: 'in_progress',
          completedObjectives: [
            {
              objectiveIndex: 0,
              note: 'Party found tracks leading to the cave',
            },
          ],
        },
      ],
      npcsIntroduced: [
        {
          name: 'Sildar Hallwinter',
          description: "A human male warrior of the Lords' Alliance",
          location: 'On the road to Phandalin',
          isAlive: true,
        },
      ],
      lootAwarded: [
        {
          item: 'Potion of Healing',
          quantity: 2,
          characterId: characters[0]._id,
          value: 50,
        },
      ],
      importantLocations: ['Neverwinter', 'Triboar Trail'],
      characterUpdates: [
        {
          characterId: characters[0]._id,
          levelUp: false,
          significantItems: ['Potion of Healing'],
          notes: 'Used 2 spell slots in combat',
        },
        {
          characterId: characters[1]._id,
          levelUp: false,
          significantItems: [],
          notes: 'Took 5 damage in combat',
        },
      ],
      notes: {
        private: 'Players seemed to enjoy the combat encounter',
        public: 'Great first session everyone!',
      },
      attendance: [
        {
          playerId: players[1]._id,
          characterId: characters[0]._id,
          present: true,
        },
        {
          playerId: players[2]._id,
          characterId: characters[1]._id,
          present: true,
        },
      ],
    });

    console.log('🎲 Created session');
    console.log('✅ Database seeded successfully!');

    // Optional: Return the created objects for testing
    return {
      players,
      characters,
      campaign,
      quest,
      session,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

//This will allow us to run the seeder via node
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
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

export default seedDatabase;
