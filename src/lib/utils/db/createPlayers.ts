// createPlayers.ts
import { Player } from '../../models/Player.js';

export async function createPlayers() {
  const players = await Player.create([
    {
      email: 'dm1@example.com',
      username: 'EpicDM',
      displayName: 'Dragon Master',
      discord: 'dragonmaster#1234',
      preferredPronouns: 'they/them',
      timezone: 'America/New_York',
      availability: [
        {
          dayOfWeek: 5,
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
    {
      email: 'player3@example.com',
      username: 'Zephyr',
      displayName: 'Alex',
      discord: 'zephyr#3456',
      preferredPronouns: 'he/they',
      timezone: 'America/Denver',
      availability: [
        {
          dayOfWeek: 5,
          startTime: '19:00',
          endTime: '23:00',
        },
      ],
    },
    // Second campaign's players
    {
      email: 'dm2@example.com',
      username: 'LoreMaster',
      displayName: 'Story Weaver',
      discord: 'loremaster#7890',
      preferredPronouns: 'she/her',
      timezone: 'Europe/London',
      availability: [
        {
          dayOfWeek: 2,
          startTime: '18:00',
          endTime: '22:00',
        },
      ],
    },
    {
      email: 'player4@example.com',
      username: 'Ravenna',
      displayName: 'Rachel',
      discord: 'ravenna#2468',
      preferredPronouns: 'she/her',
      timezone: 'Europe/Paris',
      availability: [
        {
          dayOfWeek: 2,
          startTime: '18:00',
          endTime: '22:00',
        },
      ],
    },
    {
      email: 'player5@example.com',
      username: 'Grimm',
      displayName: 'Greg',
      discord: 'grimm#1357',
      preferredPronouns: 'he/him',
      timezone: 'Europe/Berlin',
      availability: [
        {
          dayOfWeek: 2,
          startTime: '18:00',
          endTime: '22:00',
        },
      ],
    },
    {
      email: 'player6@example.com',
      username: 'Luna',
      displayName: 'Lily',
      discord: 'luna#9876',
      preferredPronouns: 'she/her',
      timezone: 'Europe/Amsterdam',
      availability: [
        {
          dayOfWeek: 2,
          startTime: '18:00',
          endTime: '22:00',
        },
      ],
    },
  ]);

  console.log('👥 Created players');
  return players;
}
