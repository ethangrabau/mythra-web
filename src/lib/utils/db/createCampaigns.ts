// createCampaigns.ts
import { Campaign } from '../../models/Campaign.js';

export async function createCampaigns(players: any[], characters: any[]) {
  const campaigns = await Campaign.create([
    {
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
        {
          playerId: players[3]._id,
          characterId: characters[2]._id,
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
      nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    },
    {
      name: 'Curse of Strahd',
      description: 'A gothic horror campaign in the domain of Barovia',
      dmId: players[4]._id, // Second DM
      players: [
        {
          playerId: players[5]._id,
          characterId: characters[3]._id,
          isActive: true,
          joinDate: new Date(),
        },
        {
          playerId: players[6]._id,
          characterId: characters[4]._id,
          isActive: true,
          joinDate: new Date(),
        },
        {
          playerId: players[7]._id,
          characterId: characters[5]._id,
          isActive: true,
          joinDate: new Date(),
        },
      ],
      setting: 'Ravenloft',
      startDate: new Date(),
      level: {
        start: 1,
        current: 3,
      },
      status: 'active',
      nextSessionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      tags: ['horror', 'roleplay-heavy', 'official-campaign'],
      quests: {
        mainQuests: [],
        sideQuests: [],
        characterQuests: [],
        factionQuests: [],
        activeQuests: [],
        completedQuests: [],
        failedQuests: [],
      },
    },
  ]);

  console.log('📚 Created campaigns');
  return campaigns;
}
