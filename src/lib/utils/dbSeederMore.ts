// import path from 'path';
// import { fileURLToPath } from 'url';
// import { connectToDatabase } from './dbSeederConnect.js';
// import dbConnect from '../db';
// import { Campaign, Session, Player, Character, Quest } from '../models';
// import mongoose from 'mongoose';

// async function clearDatabase() {
//   await Promise.all([
//     Campaign.deleteMany({}),
//     Session.deleteMany({}),
//     Player.deleteMany({}),
//     Character.deleteMany({}),
//     Quest.deleteMany({}),
//   ]);
//   console.log('Cleared db data. Ready to seed!');
// }

// async function createPlayers() {
//   const players = await Player.create([
//     {
//       email: 'dm1@example.com',
//       username: 'LoreMaster',
//       displayName: 'Alex Thompson',
//       discord: 'loremaster#1234',
//       timezone: 'America/New_York',
//       availability: [
//         { dayOfWeek: 5, startTime: '19:00', endTime: '23:00' },
//         { dayOfWeek: 6, startTime: '14:00', endTime: '22:00' },
//       ],
//     },
//     {
//       email: 'dm2@example.com',
//       username: 'DragonQueen',
//       displayName: 'Sarah Chen',
//       discord: 'dragonqueen#5678',
//       timezone: 'America/Los_Angeles',
//       availability: [
//         { dayOfWeek: 3, startTime: '18:00', endTime: '22:00' },
//         { dayOfWeek: 4, startTime: '19:00', endTime: '23:00' },
//       ],
//     },
//     // Players for first campaign
//     {
//       email: 'player1@example.com',
//       username: 'Shadowblade',
//       displayName: 'Marcus Wright',
//       discord: 'shadowblade#2345',
//       timezone: 'America/Chicago',
//     },
//     {
//       email: 'player2@example.com',
//       username: 'Spellweaver',
//       displayName: 'Emma Davis',
//       discord: 'spellweaver#3456',
//       timezone: 'America/New_York',
//     },
//     {
//       email: 'player3@example.com',
//       username: 'WarMaster',
//       displayName: 'James Wilson',
//       discord: 'warmaster#4567',
//       timezone: 'America/Chicago',
//     },
//     {
//       email: 'player4@example.com',
//       username: 'HolyLight',
//       displayName: 'Lisa Anderson',
//       discord: 'holylight#5678',
//       timezone: 'America/New_York',
//     },
//     // Players for second campaign
//     {
//       email: 'player5@example.com',
//       username: 'NatureCaller',
//       displayName: 'David Brown',
//       discord: 'naturecaller#6789',
//       timezone: 'America/Los_Angeles',
//     },
//     {
//       email: 'player6@example.com',
//       username: 'StormBringer',
//       displayName: 'Rachel Green',
//       discord: 'stormbringer#7890',
//       timezone: 'America/Los_Angeles',
//     },
//     {
//       email: 'player7@example.com',
//       username: 'BattleSmith',
//       displayName: 'Michael Lee',
//       discord: 'battlesmith#8901',
//       timezone: 'America/Chicago',
//     },
//     {
//       email: 'player8@example.com',
//       username: 'MysticSage',
//       displayName: 'Emily White',
//       discord: 'mysticsage#9012',
//       timezone: 'America/New_York',
//     },
//   ]);

//   console.log('👥 Created players');
//   return players;
// }

// async function createCharacters(players: any) {
//   const characters = await Character.create([
//     // Characters for first campaign
//     {
//       playerId: players[2]._id,
//       name: 'Raven Shadowwalker',
//       class: [{ name: 'Rogue', level: 6, subclass: 'Assassin' }],
//       race: 'Half-Elf',
//       background: 'Criminal',
//       alignment: 'CN',
//       experience: 15000,
//       stats: {
//         strength: 12,
//         dexterity: 18,
//         constitution: 14,
//         intelligence: 14,
//         wisdom: 12,
//         charisma: 16,
//       },
//     },
//     {
//       playerId: players[3]._id,
//       name: 'Luna Starweaver',
//       class: [{ name: 'Wizard', level: 6, subclass: 'School of Evocation' }],
//       race: 'High Elf',
//       background: 'Sage',
//       alignment: 'NG',
//       experience: 15000,
//       stats: {
//         strength: 8,
//         dexterity: 14,
//         constitution: 14,
//         intelligence: 18,
//         wisdom: 12,
//         charisma: 10,
//       },
//     },
//     {
//       playerId: players[4]._id,
//       name: 'Thorgrim Battlehammer',
//       class: [{ name: 'Fighter', level: 6, subclass: 'Battle Master' }],
//       race: 'Mountain Dwarf',
//       background: 'Soldier',
//       alignment: 'LG',
//       experience: 15000,
//       stats: {
//         strength: 18,
//         dexterity: 12,
//         constitution: 16,
//         intelligence: 10,
//         wisdom: 12,
//         charisma: 8,
//       },
//     },
//     {
//       playerId: players[5]._id,
//       name: 'Seraphina Lightbringer',
//       class: [{ name: 'Cleric', level: 6, subclass: 'Life Domain' }],
//       race: 'Human',
//       background: 'Acolyte',
//       alignment: 'LG',
//       experience: 15000,
//       stats: {
//         strength: 14,
//         dexterity: 10,
//         constitution: 14,
//         intelligence: 12,
//         wisdom: 18,
//         charisma: 14,
//       },
//     },
//     // Characters for second campaign
//     {
//       playerId: players[6]._id,
//       name: 'Aria Windwhisper',
//       class: [{ name: 'Druid', level: 4, subclass: 'Circle of the Moon' }],
//       race: 'Wood Elf',
//       background: 'Outlander',
//       alignment: 'NG',
//       experience: 3800,
//       stats: {
//         strength: 10,
//         dexterity: 14,
//         constitution: 14,
//         intelligence: 12,
//         wisdom: 18,
//         charisma: 12,
//       },
//     },
//     {
//       playerId: players[7]._id,
//       name: 'Tempest Stormforge',
//       class: [{ name: 'Sorcerer', level: 4, subclass: 'Storm Sorcery' }],
//       race: 'Half-Orc',
//       background: 'Sailor',
//       alignment: 'CG',
//       experience: 3800,
//       stats: {
//         strength: 14,
//         dexterity: 12,
//         constitution: 14,
//         intelligence: 10,
//         wisdom: 12,
//         charisma: 18,
//       },
//     },
//     {
//       playerId: players[8]._id,
//       name: 'Grimforge Ironheart',
//       class: [{ name: 'Artificer', level: 4, subclass: 'Battle Smith' }],
//       race: 'Dwarf',
//       background: 'Guild Artisan',
//       alignment: 'LN',
//       experience: 3800,
//       stats: {
//         strength: 14,
//         dexterity: 12,
//         constitution: 16,
//         intelligence: 18,
//         wisdom: 12,
//         charisma: 8,
//       },
//     },
//     {
//       playerId: players[9]._id,
//       name: 'Celeste Moonshadow',
//       class: [{ name: 'Warlock', level: 4, subclass: 'Archfey' }],
//       race: 'Tiefling',
//       background: 'Charlatan',
//       alignment: 'CN',
//       experience: 3800,
//       stats: {
//         strength: 8,
//         dexterity: 14,
//         constitution: 14,
//         intelligence: 12,
//         wisdom: 10,
//         charisma: 18,
//       },
//     },
//   ]);

//   console.log('🧙‍♂️ Created characters');
//   return characters;
// }

// async function createCampaigns(players: any, characters: any) {
//   const campaigns = await Campaign.create([
//     {
//       name: 'Curse of Strahd: Dark Lords of Ravenloft',
//       description: 'A gothic horror campaign set in the mist-shrouded realm of Barovia',
//       dmId: players[0]._id,
//       players: [
//         {
//           playerId: players[2]._id,
//           characterId: characters[0]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
//         },
//         {
//           playerId: players[3]._id,
//           characterId: characters[1]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
//         },
//         {
//           playerId: players[4]._id,
//           characterId: characters[2]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
//         },
//         {
//           playerId: players[5]._id,
//           characterId: characters[3]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
//         },
//       ],
//       setting: 'Ravenloft',
//       startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
//       level: {
//         start: 1,
//         current: 6,
//       },
//       status: 'active',
//       nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       tags: ['horror', 'roleplay-heavy', 'combat'],
//       quests: {
//         mainQuests: [],
//         sideQuests: [],
//         characterQuests: [],
//         factionQuests: [],
//         activeQuests: [],
//         completedQuests: [],
//         failedQuests: [],
//       },
//     },
//     {
//       name: "Storm King's Thunder: Rise of the Giants",
//       description: 'An epic adventure across the Sword Coast as giants threaten civilization',
//       dmId: players[1]._id,
//       players: [
//         {
//           playerId: players[6]._id,
//           characterId: characters[4]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
//         },
//         {
//           playerId: players[7]._id,
//           characterId: characters[5]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//         },
//         {
//           playerId: players[8]._id,
//           characterId: characters[6]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//         },
//         {
//           playerId: players[9]._id,
//           characterId: characters[7]._id,
//           isActive: true,
//           joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//         },
//       ],
//       setting: 'Forgotten Realms',
//       startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//       level: {
//         start: 1,
//         current: 4,
//       },
//       status: 'active',
//       nextSessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
//       tags: ['adventure', 'combat-heavy', 'exploration'],
//       quests: {
//         mainQuests: [],
//         sideQuests: [],
//         characterQuests: [],
//         factionQuests: [],
//         activeQuests: [],
//         completedQuests: [],
//         failedQuests: [],
//       },
//     },
//   ]);

//   console.log('📚 Created campaigns');
//   return campaigns;
// }

// async function createQuests(campaigns: any) {
//   // Quests for first campaign (Curse of Strahd)
//   const strahdsQuests = await Quest.create([
//     {
//       campaignId: campaigns[0]._id,
//       name: 'The Death House',
//       description: 'Investigate the haunted mansion on the edge of the village',
//       type: 'main',
//       status: 'completed',
//       difficulty: 'hard',
//       giver: {
//         name: 'Rose and Thorn',
//         type: 'npc',
//         location: 'Village of Barovia',
//       },
//       objectives: [
//         {
//           description: 'Enter the Death House',
//           completed: true,
//           optional: false,
//         },
//         {
//           description: 'Discover the cult in the basement',
//           completed: true,
//           optional: false,
//         },
//         {
//           description: 'Defeat the shambling mound',
//           completed: true,
//           optional: false,
//         },
//       ],
//       rewards: {
//         experience: 1000,
//         items: ['Deed to the House', 'Silver Locket'],
//       },
//     },
//     {
//       campaignId: campaigns[0]._id,
//       name: 'The Tome of Strahd',
//       description: "Find and recover the ancient tome containing Strahd's history",
//       type: 'main',
//       status: 'completed',
//       difficulty: 'medium',
//       giver: {
//         name: 'Madam Eva',
//         type: 'npc',
//         location: 'Tser Pool',
//       },
//       objectives: [
//         {
//           description: 'Locate the tome',
//           completed: true,
//           optional: false,
//         },
//         {
//           description: 'Decipher the contents',
//           completed: true,
//           optional: false,
//         },
//       ],
//       rewards: {
//         experience: 1500,
//         items: ['Tome of Strahd', 'Ancient Coin'],
//       },
//     },
//     {
//       campaignId: campaigns[0]._id,
//       name: 'The Sunsword',
//       description: 'Recover the legendary weapon that can defeat Strahd',
//       type: 'main',
//       status: 'in_progress',
//       difficulty: 'hard',
//       giver: {
//         name: 'Rudolph van Richten',
//         type: 'npc',
//         location: 'Vallaki',
//       },
//       objectives: [
//         {
//           description: "Find the sword's location",
//           completed: true,
//           optional: false,
//         },
//         {
//           description: "Defeat the sword's guardian",
//           completed: false,
//           optional: false,
//         },
//         {
//           description: 'Reforge the blade',
//           completed: false,
//           optional: false,
//         },
//       ],
//       rewards: {
//         experience: 2000,
//         items: ['Sunsword'],
//       },
//     },
//   ]);

//   // Quests for second campaign (Storm King's Thunder)
//   const giantsQuests = await Quest.create([
//     {
//       campaignId: campaigns[1]._id,
//       name: "Nightstone's Fall",
//       description: 'Investigate the cloud giant attack on Nightstone',
//       type: 'main',
//       status: 'completed',
//       difficulty: 'medium',
//       giver: {
//         name: 'Lady Velrosa',
//         type: 'npc',
//         location: 'Waterdeep',
//       },
//       objectives: [
//         {
//           description: 'Reach Nightstone',
//           completed: true,
//           optional: false,
//         },
//         {
//           description: 'Clear the village of goblins',
//           completed: true,
//           optional: false,
//         },
//       ],
//       rewards: {
//         gold: 500,
//         experience: 1000,
//         items: ['Map of Giant Territories'],
//       },
//     },
//     {
//       campaignId: campaigns[1]._id,
//       name: 'The Eye of the All-Father',
//       description: 'Seek wisdom at the ancient temple of the giant gods',
//       type: 'main',
//       status: 'not_started',
//       difficulty: 'hard',
//       giver: {
//         name: 'Harshnag',
//         type: 'npc',
//         location: 'Savage Frontier',
//       },
//       objectives: [
//         {
//           description: 'Find the temple entrance',
//           completed: false,
//           optional: false,
//         },
//         {
//           description: 'Complete the trials',
//           completed: false,
//           optional: false,
//         },
//       ],
//       rewards: {
//         experience: 2000,
//         items: ['Rune of the Frost Giants'],
//       },
//     },
//     {
//       campaignId: campaigns[1]._id,
//       name: 'Defense of Bryn Shander',
//       description: 'Protect the town from frost giant raiders',
//       type: 'main',
//       status: 'failed',
//       difficulty: 'hard',
//       giver: {
//         name: 'Sheriff Markham',
//         type: 'npc',
//         location: 'Bryn Shander',
//       },
//       objectives: [
//         {
//           description: 'Fortify the walls',
//           completed: true,
//           optional: false,
//         },
//         {
//           description: 'Prevent civilian casualties',
//           completed: false,
//           optional: false,
//         },
//       ],
//       rewards: {
//         gold: 1000,
//         experience: 1500,
//       },
//     },
//   ]);

//   // Update campaign quest arrays
//   campaigns[0].quests.mainQuests.push(...strahdsQuests.map(q => q._id));
//   campaigns[0].quests.completedQuests.push(strahdsQuests[0]._id, strahdsQuests[1]._id);
//   campaigns[0].quests.activeQuests.push(strahdsQuests[2]._id);

//   campaigns[1].quests.mainQuests.push(...giantsQuests.map(q => q._id));
//   campaigns[1].quests.completedQuests.push(giantsQuests[0]._id);
//   campaigns[1].quests.failedQuests.push(giantsQuests[2]._id);

//   await Promise.all(campaigns.map(c => c.save()));

//   console.log('📜 Created quests');
//   return { strahdsQuests, giantsQuests };
// }

// async function createSessions(campaigns, quests, players, characters) {
//   // Sessions for first campaign (Curse of Strahd)
//   const strahdsSessions = await Session.create([
//     {
//       campaignId: campaigns[0]._id,
//       sessionNumber: 1,
//       date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
//       duration: 240,
//       location: {
//         name: 'Roll20',
//         isVirtual: true,
//         platform: 'Roll20',
//       },
//       summary: 'The party entered Barovia and discovered the Death House',
//       combatEncounters: [
//         {
//           name: 'Animated Armor',
//           difficulty: 'medium',
//           outcome: 'Victory - Party defeated the armor with minimal damage',
//         },
//         {
//           name: 'Specter in the Nursery',
//           difficulty: 'hard',
//           outcome: 'Victory - Cleric turned the specter',
//         },
//       ],
//       questProgress: [
//         {
//           questId: quests.strahdsQuests[0]._id,
//           previousStatus: 'not_started',
//           newStatus: 'in_progress',
//           completedObjectives: [
//             {
//               objectiveIndex: 0,
//               note: 'Party entered the Death House',
//             },
//           ],
//         },
//       ],
//       npcsIntroduced: [
//         {
//           name: 'Rose and Thorn',
//           description: 'Ghost children of the Death House',
//           location: 'Death House',
//           isAlive: false,
//         },
//       ],
//       attendance: characters.slice(0, 4).map(char => ({
//         playerId: char.playerId,
//         characterId: char._id,
//         present: true,
//       })),
//     },
//     {
//       campaignId: campaigns[0]._id,
//       sessionNumber: 2,
//       date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
//       duration: 240,
//       location: {
//         name: 'Roll20',
//         isVirtual: true,
//         platform: 'Roll20',
//       },
//       summary: 'The party completed the Death House and found the Tome of Strahd',
//       combatEncounters: [
//         {
//           name: 'Shambling Mound',
//           difficulty: 'hard',
//           outcome: 'Victory - Near TPK but successful',
//         },
//       ],
//       questProgress: [
//         {
//           questId: quests.strahdsQuests[0]._id,
//           previousStatus: 'in_progress',
//           newStatus: 'completed',
//           completedObjectives: [
//             {
//               objectiveIndex: 1,
//               note: 'Discovered the cult',
//             },
//             {
//               objectiveIndex: 2,
//               note: 'Defeated the shambling mound',
//             },
//           ],
//         },
//       ],
//       attendance: characters.slice(0, 4).map(char => ({
//         playerId: char.playerId,
//         characterId: char._id,
//         present: true,
//       })),
//     },
//   ]);

//   Sessions for second campaign (Storm King's Thunder)
//   const giantsSessions = await Session.create([
//     {
//       campaignId: campaigns[1]._id,
//       sessionNumber: 1,
//       date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
//       duration: 240,
//       location: {
//         name: 'Discord',
//         isVirtual: true,
//         platform: 'Discord',
//       },
//       summary: 'The party arrives at Nightstone to find it recently attacked by cloud giants',
//       combatEncounters: [
//         {
//           name: 'Goblin Raid',
//           difficulty: 'medium',
//           outcome: 'Victory - Cleared the goblins from Nightstone',
//         },
//       ],
//       questProgress: [
//         {
//           questId: quests.giantsQuests[0]._id,
//           previousStatus: 'not_started',
//           newStatus: 'in_progress',
//           completedObjectives: [
//             {
//               objectiveIndex: 0,
//               note: 'Reached Nightstone',
//             },
//           ],
//         },
//       ],
//       attendance: characters.slice(4, 8).map(char => ({
//         playerId: char.playerId,
//         characterId: char._id,
//         present: true,
//       })),
