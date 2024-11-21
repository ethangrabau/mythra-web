// createCharacters.ts
import { Character } from '../../models/Character.js';

export async function createCharacters(players: any[]) {
  const characters = await Character.create([
    // First campaign characters
    {
      playerId: players[1]._id,
      name: 'Eldrin Silverleaf',
      class: [
        {
          name: 'Wizard',
          level: 5,
          subclass: 'School of Evocation',
        },
      ],
      race: 'High Elf',
      imageUrl: 'https://ibb.co/HF1KV7P',
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
      playerId: players[2]._id,
      name: 'Thorgar Ironfist',
      class: [
        {
          name: 'Fighter',
          level: 5,
          subclass: 'Battle Master',
        },
      ],
      race: 'Mountain Dwarf',
      imageUrl: 'https://ibb.co/88BTg0L',
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
          item: 'Longsword',
          quantity: 1,
          equipped: true,
          attuned: false,
        },
      ],
    },
    {
      playerId: players[3]._id,
      name: 'Aria Shadowsong',
      class: [
        {
          name: 'Rogue',
          level: 5,
          subclass: 'Thief',
        },
      ],
      race: 'Halfling',
      imageUrl: 'https://ibb.co/ZS5KrW7',
      background: 'Criminal',
      alignment: 'CN',
      experience: 6500,
      stats: {
        strength: 10,
        dexterity: 16,
        constitution: 12,
        intelligence: 14,
        wisdom: 12,
        charisma: 14,
      },
      personalityTraits: ['Always has an escape plan'],
      bonds: ['Loyal to their thieves guild'],
      ideals: ['Freedom above all'],
      flaws: ['Kleptomaniac tendencies'],
      inventory: [
        {
          item: 'Thieves Tools',
          quantity: 1,
          equipped: true,
          attuned: false,
        },
      ],
    },
    // Second campaign characters
    {
      playerId: players[5]._id,
      name: 'Ravenna Blackwood',
      class: [
        {
          name: 'Warlock',
          level: 3,
          subclass: 'The Great Old One',
        },
      ],
      race: 'Tiefling',
      imageUrl: 'https://ibb.co/C1cpDTq',
      background: 'Noble',
      alignment: 'LN',
      experience: 2700,
      stats: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 14,
        wisdom: 10,
        charisma: 16,
      },
      personalityTraits: ['Speaks in riddles'],
      bonds: ['Bound to an ancient entity'],
      ideals: ['Power at any cost'],
      flaws: ['Trust issues'],
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
      playerId: players[6]._id,
      name: 'Grimm Ironheart',
      class: [
        {
          name: 'Paladin',
          level: 3,
          subclass: 'Oath of Vengeance',
        },
      ],
      race: 'Human',
      imageUrl: 'https://ibb.co/N3JLH3N',
      background: 'Acolyte',
      alignment: 'LG',
      experience: 2700,
      stats: {
        strength: 16,
        dexterity: 10,
        constitution: 14,
        intelligence: 8,
        wisdom: 12,
        charisma: 14,
      },
      personalityTraits: ['Serious and determined'],
      bonds: ['Sworn to defeat evil'],
      ideals: ['Justice must prevail'],
      flaws: ['Zealously devoted to cause'],
      inventory: [
        {
          item: '1H Hammer',
          quantity: 1,
          equipped: true,
          attuned: false,
        },
        {
          item: 'Kite Shield',
          quantity: 1,
          equipped: true,
          attuned: false,
        },
      ],
    },
    {
      playerId: players[7]._id,
      name: 'Luna Moonshadow',
      class: [
        {
          name: 'Druid',
          level: 3,
          subclass: 'Circle of the Moon',
        },
      ],
      race: 'Wood Elf',
      imageUrl: 'https://ibb.co/CPDHHyR',
      background: 'Outlander',
      alignment: 'NG',
      experience: 2700,
      stats: {
        strength: 10,
        dexterity: 14,
        constitution: 12,
        intelligence: 10,
        wisdom: 16,
        charisma: 12,
      },
      personalityTraits: ['One with nature'],
      bonds: ['Protector of the forests'],
      ideals: ['Balance in all things'],
      flaws: ['Distrusts civilization'],
      inventory: [
        {
          item: 'Druidic Focus',
          quantity: 1,
          equipped: true,
          attuned: false,
        },
      ],
    },
  ]);

  console.log('🧙‍♂️ Created characters');
  return characters;
}
