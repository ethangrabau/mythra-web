// createQuests.ts
import { Quest } from '../../models/Quest.js';

export async function createQuests(campaignIds: string[]) {
  // First campaign quests
  const firstCampaignQuests = await Quest.create([
    {
      campaignId: campaignIds[0],
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
    },
    {
      campaignId: campaignIds[0],
      name: 'Retrieve the Ancient Artifact',
      description: 'Recover a powerful magical artifact from ruins',
      type: 'main',
      status: 'completed',
      difficulty: 'hard',
      giver: {
        name: 'Archmage Andromath',
        type: 'npc',
        location: 'Neverwinter',
      },
      objectives: [
        {
          description: 'Find the ruins entrance',
          completed: true,
          optional: false,
        },
        {
          description: 'Solve the ancient puzzles',
          completed: true,
          optional: false,
        },
        {
          description: 'Retrieve the artifact',
          completed: true,
          optional: false,
        },
      ],
      rewards: {
        gold: 500,
        experience: 1000,
        items: ['Staff of Power', 'Ancient Scrolls'],
      },
    },
    {
      campaignId: campaignIds[0],
      name: 'Investigate the Cult',
      description: 'Uncover the plans of a mysterious cult',
      type: 'main',
      status: 'in_progress',
      difficulty: 'hard',
      giver: {
        name: 'Lord Commander',
        type: 'npc',
        location: 'City Watch HQ',
      },
      objectives: [
        {
          description: 'Infiltrate cult meetings',
          completed: true,
          optional: false,
        },
        {
          description: 'Identify cult leader',
          completed: false,
          optional: false,
        },
        {
          description: 'Stop the ritual',
          completed: false,
          optional: false,
        },
      ],
      rewards: {
        gold: 1000,
        experience: 1500,
        items: ['Ring of Protection', 'Cult Artifacts'],
      },
    },
  ]);

  // Second campaign quests
  const secondCampaignQuests = await Quest.create([
    {
      campaignId: campaignIds[1],
      name: 'Defend the Village',
      description: 'Protect a village from bandit raids',
      type: 'main',
      status: 'failed',
      difficulty: 'medium',
      giver: {
        name: 'Village Elder',
        type: 'npc',
        location: 'Riverdale',
      },
      objectives: [
        {
          description: 'Set up village defenses',
          completed: true,
          optional: false,
        },
        {
          description: 'Defeat bandit raid',
          completed: false,
          optional: false,
        },
      ],
      rewards: {
        gold: 200,
        experience: 400,
        items: ['Village Medallion'],
      },
    },
    {
      campaignId: campaignIds[1],
      name: 'The Lost Heir',
      description: 'Find and protect the missing heir to the throne',
      type: 'main',
      status: 'completed',
      difficulty: 'hard',
      giver: {
        name: 'Royal Advisor',
        type: 'npc',
        location: 'Capital City',
      },
      objectives: [
        {
          description: 'Track down heir location',
          completed: true,
          optional: false,
        },
        {
          description: 'Rescue heir from kidnappers',
          completed: true,
          optional: false,
        },
        {
          description: 'Return heir safely',
          completed: true,
          optional: false,
        },
      ],
      rewards: {
        gold: 1000,
        experience: 1500,
        items: ['Royal Signet Ring', 'Noble Cloak'],
      },
    },
    {
      campaignId: campaignIds[1],
      name: "The Dragon's Hoard",
      description: "Locate and retrieve treasure from an ancient dragon's lair",
      type: 'main',
      status: 'not_started',
      difficulty: 'very_hard',
      giver: {
        name: 'Merchant Prince',
        type: 'npc',
        location: 'Trading Post',
      },
      objectives: [
        {
          description: "Find the dragon's lair",
          completed: false,
          optional: false,
        },
        {
          description: 'Retrieve the ancient artifacts',
          completed: false,
          optional: false,
        },
        {
          description: 'Escape with the treasure',
          completed: false,
          optional: false,
        },
      ],
      rewards: {
        gold: 5000,
        experience: 3000,
        items: ['Dragon Scale Armor', 'Ancient Treasure Map'],
      },
    },
  ]);

  console.log('📜 Created quests');
  return [...firstCampaignQuests, ...secondCampaignQuests];
}
