// createLocations.ts
import { Location } from '../../models/Location.js';

export async function createLocations(campaigns: any[], quests: any[]) {
  const locations = await Location.create([
    {
      name: 'Phandalin',
      description:
        'A small frontier town located east of the Sword Mountains, experiencing a rebirth after being abandoned for centuries.',
      type: 'town',
      isDiscovered: true,
      isRestricted: false,
      campaigns: [campaigns[0]._id], // Associated with the first campaign
      quests: [quests[0]._id, quests[1]._id], // Quests related to this location
      tags: ['frontier', 'mining', 'settlement'],
      notes: {
        dm: ['Town is under threat from the Redbrand Ruffians.'],
        player: ['A welcoming town with opportunities for adventurers.'],
      },
    },
    {
      name: 'Cragmaw Castle',
      description: 'An old castle hidden in the deep woods, now occupied by the Cragmaw goblin tribe led by King Grol.',
      type: 'dungeon',
      isDiscovered: false,
      isRestricted: true,
      entryRequirements: ['Navigate through Neverwinter Wood', 'Avoid goblin patrols'],
      campaigns: [campaigns[0]._id],
      quests: [quests[0]._id], // "Clear the Goblin Cave"
      tags: ['goblin', 'castle', 'ruins'],
      notes: {
        dm: ['Contains important NPC captive and maps to Wave Echo Cave.'],
        player: [],
      },
    },
    {
      name: 'Neverwinter',
      description: 'A large and bustling city known as the Jewel of the North, recovering from a volcanic eruption.',
      type: 'city',
      isDiscovered: true,
      isRestricted: false,
      campaigns: [campaigns[0]._id, campaigns[1]._id],
      quests: [],
      tags: ['city', 'trade hub', 'cosmopolitan'],
      notes: {
        dm: ['Great starting point for adventures, offers many side quests.'],
        player: ['A vibrant city with diverse inhabitants and opportunities.'],
      },
    },
    {
      name: 'Barovia Village',
      description: 'A dreary village overshadowed by the presence of Count Strahd von Zarovich, surrounded by mist.',
      type: 'village',
      isDiscovered: true,
      isRestricted: false,
      campaigns: [campaigns[1]._id], // Second campaign
      quests: [quests[3]._id], // "Defend the Village"
      tags: ['gothic', 'haunted', 'mysterious'],
      notes: {
        dm: ['Villagers are wary of outsiders and fear Strahd.'],
        player: ['An eerie village where something feels off.'],
      },
    },
    {
      name: 'Castle Ravenloft',
      description: 'A towering castle atop a cliff, home to the vampire lord Strahd von Zarovich.',
      type: 'dungeon',
      isDiscovered: false,
      isRestricted: true,
      entryRequirements: ['Invitation from Strahd', 'Special artifacts to enter safely'],
      campaigns: [campaigns[1]._id],
      quests: [quests[4]._id], // "The Lost Heir"
      tags: ['vampire', 'castle', 'dangerous'],
      notes: {
        dm: ['Final destination in the campaign; filled with deadly traps and enemies.'],
        player: [],
      },
    },
    {
      name: 'Wave Echo Cave',
      description: 'An ancient cavern rich with magic and minerals, location of the legendary Phandelver’s Pact.',
      type: 'dungeon',
      isDiscovered: false,
      isRestricted: true,
      entryRequirements: ['Find the map to the cave', 'Overcome cave guardians'],
      campaigns: [campaigns[0]._id],
      quests: [quests[1]._id], // "Retrieve the Ancient Artifact"
      tags: ['mine', 'magical', 'ancient'],
      notes: {
        dm: ['Contains the Forge of Spells; pivotal for the campaign’s climax.'],
        player: [],
      },
    },
    {
      name: 'The High Road',
      description: 'A major trade route along the Sword Coast connecting Neverwinter and Waterdeep.',
      type: 'wilderness',
      isDiscovered: true,
      isRestricted: false,
      campaigns: [campaigns[0]._id, campaigns[1]._id],
      quests: [],
      tags: ['trade route', 'dangerous', 'travel'],
      notes: {
        dm: ['Bandits and monsters often threaten travelers here.'],
        player: ['A long road with potential threats; stay vigilant.'],
      },
    },
    {
      name: 'Triboar Trail',
      description: 'A lesser-used trail branching off from the High Road, leading to Phandalin.',
      type: 'wilderness',
      isDiscovered: true,
      isRestricted: false,
      campaigns: [campaigns[0]._id],
      quests: [],
      tags: ['trail', 'ambush site', 'remote'],
      notes: {
        dm: ['Common place for goblin ambushes.'],
        player: ['Keep an eye out for danger along this path.'],
      },
    },
    {
      name: 'Icewind Dale',
      description: 'A frozen tundra in the far north, home to ten small towns and many dangers.',
      type: 'wilderness',
      isDiscovered: false,
      isRestricted: false,
      campaigns: [],
      quests: [],
      tags: ['arctic', 'isolated', 'harsh climate'],
      notes: {
        dm: ['Potential future campaign setting with unique challenges.'],
        player: [],
      },
    },
    {
      name: 'Candlekeep',
      description: 'A fortress library housing a vast collection of knowledge and guarded by monks.',
      type: 'fortress',
      isDiscovered: true,
      isRestricted: true,
      entryRequirements: ['Donation of a unique book'],
      campaigns: [],
      quests: [],
      tags: ['library', 'scholarly', 'protected'],
      notes: {
        dm: ['A place for players to research and seek knowledge.'],
        player: ['An impressive library with strict entry requirements.'],
      },
    },
  ]);

  console.log('📍 Created locations');
  return locations;
}
