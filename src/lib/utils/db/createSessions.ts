// createSessions.ts
import { Session } from '../../models/Session.js';

export async function createSessions(campaigns: any[], characters: any[], quests: any[]) {
  const sessions = await Session.create([
    // First campaign sessions
    {
      campaignId: campaigns[0]._id,
      sessionNumber: 1,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      duration: 240,
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
          questId: quests[0]._id,
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
      ],
      notes: {
        private: 'Players seemed to enjoy the combat encounter',
        public: 'Great first session everyone!',
      },
      attendance: [
        {
          playerId: campaigns[0].players[0].playerId,
          characterId: characters[0]._id,
          present: true,
        },
        {
          playerId: campaigns[0].players[1].playerId,
          characterId: characters[1]._id,
          present: true,
        },
        {
          playerId: campaigns[0].players[2].playerId,
          characterId: characters[2]._id,
          present: true,
        },
      ],
    },
    {
      campaignId: campaigns[0]._id,
      sessionNumber: 2,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      duration: 240,
      location: {
        name: 'Roll20',
        isVirtual: true,
        platform: 'Roll20',
      },
      summary: 'The party explored the goblin cave and rescued Sildar',
      combatEncounters: [
        {
          name: 'Cave Battle',
          difficulty: 'hard',
          outcome: 'Party defeated the goblin leader and his guards',
        },
      ],
      questProgress: [
        {
          questId: quests[0]._id,
          previousStatus: 'in_progress',
          newStatus: 'completed',
          completedObjectives: [
            {
              objectiveIndex: 1,
              note: 'Defeated the goblin leader and cleared the cave',
            },
          ],
        },
      ],
      npcsIntroduced: [
        {
          name: 'Yeemik',
          description: 'Goblin second-in-command',
          location: 'Cragmaw Cave',
          isAlive: false,
        },
      ],
      lootAwarded: [
        {
          item: 'Goblin War Banner',
          quantity: 1,
          characterId: characters[1]._id,
          value: 100,
        },
      ],
      importantLocations: ['Cragmaw Cave'],
      characterUpdates: [
        {
          characterId: characters[1]._id,
          levelUp: true,
          significantItems: ['Goblin War Banner'],
          notes: 'Reached level 2',
        },
      ],
      notes: {
        private: 'Need to prepare more combat encounters',
        public: 'Excellent teamwork in the cave!',
      },
      attendance: [
        {
          playerId: campaigns[0].players[0].playerId,
          characterId: characters[0]._id,
          present: true,
        },
        {
          playerId: campaigns[0].players[1].playerId,
          characterId: characters[1]._id,
          present: true,
        },
        {
          playerId: campaigns[0].players[2].playerId,
          characterId: characters[2]._id,
          present: false,
        },
      ],
    },

    // Second campaign sessions
    {
      campaignId: campaigns[1]._id,
      sessionNumber: 1,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      duration: 180,
      location: {
        name: 'Discord',
        isVirtual: true,
        platform: 'Discord',
      },
      summary: 'Party arrived in Barovia and encountered mysterious mists',
      combatEncounters: [
        {
          name: 'Dire Wolves',
          difficulty: 'medium',
          outcome: 'Party successfully drove off the wolves',
        },
      ],
      questProgress: [
        {
          questId: quests[3]._id,
          previousStatus: 'not_started',
          newStatus: 'in_progress',
          completedObjectives: [
            {
              objectiveIndex: 0,
              note: 'Village defenses began construction',
            },
          ],
        },
      ],
      npcsIntroduced: [
        {
          name: 'Madam Eva',
          description: 'Mysterious Vistani fortune teller',
          location: 'Tser Pool',
          isAlive: true,
        },
      ],
      lootAwarded: [
        {
          item: 'Ring of Protection',
          quantity: 1,
          characterId: characters[3]._id,
          value: 200,
        },
      ],
      importantLocations: ['Village of Barovia', 'Tser Pool'],
      characterUpdates: [
        {
          characterId: characters[3]._id,
          levelUp: false,
          significantItems: ['Ring of Protection'],
          notes: 'Received cryptic fortune',
        },
      ],
      notes: {
        private: 'Players seemed appropriately spooked',
        public: 'Dark beginnings in Barovia...',
      },
      attendance: [
        {
          playerId: campaigns[1].players[0].playerId,
          characterId: characters[3]._id,
          present: true,
        },
        {
          playerId: campaigns[1].players[1].playerId,
          characterId: characters[4]._id,
          present: true,
        },
        {
          playerId: campaigns[1].players[2].playerId,
          characterId: characters[5]._id,
          present: true,
        },
      ],
    },
    {
      campaignId: campaigns[1]._id,
      sessionNumber: 2,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 240,
      location: {
        name: 'Discord',
        isVirtual: true,
        platform: 'Discord',
      },
      summary: 'Failed defense of the village against overwhelming bandit forces',
      combatEncounters: [
        {
          name: 'Bandit Raid',
          difficulty: 'hard',
          outcome: 'Party forced to retreat, village partially burned',
        },
      ],
      questProgress: [
        {
          questId: quests[3]._id,
          previousStatus: 'in_progress',
          newStatus: 'failed',
          completedObjectives: [],
        },
      ],
      npcsIntroduced: [
        {
          name: 'Bandit King',
          description: 'Leader of the raiding party',
          location: 'Village of Barovia',
          isAlive: true,
        },
      ],
      lootAwarded: [],
      importantLocations: ['Burned Village'],
      characterUpdates: [
        {
          characterId: characters[4]._id,
          levelUp: false,
          significantItems: [],
          notes: 'Seriously wounded in battle',
        },
      ],
      notes: {
        private: 'Need to provide alternative quest paths',
        public: 'A dark day for the village...',
      },
      attendance: [
        {
          playerId: campaigns[1].players[0].playerId,
          characterId: characters[3]._id,
          present: true,
        },
        {
          playerId: campaigns[1].players[1].playerId,
          characterId: characters[4]._id,
          present: true,
        },
        {
          playerId: campaigns[1].players[2].playerId,
          characterId: characters[5]._id,
          present: true,
        },
      ],
    },
  ]);

  console.log('🎲 Created sessions');
  return sessions;
}
