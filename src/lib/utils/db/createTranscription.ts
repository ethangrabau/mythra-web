import { Transcription } from '../../models/Transcription.js';

export async function createTranscriptions(sessions: any[], players: any[]) {
  const transcriptions = await Transcription.create([
    // Lost Mines Session 1 Transcriptions
    {
      sessionId: sessions[0]._id,
      speakerId: players[0]._id, // DM
      content:
        "As you all gather in the Stonehill Inn at Neverwinter, a weathered man in merchant's garb approaches your table. 'I've heard you're capable adventurers. I have a proposition that could benefit us both...'",
      timestamp: new Date(sessions[0].date.getTime() + 5 * 60 * 1000), // 5 mins into session
      duration: 45,
      confidence: 0.95,
      type: 'narration',
      tags: ['scene-opening', 'npc-introduction'],
      segment: {
        index: 0,
        startTime: 300,
        endTime: 345,
      },
    },
    {
      sessionId: sessions[0]._id,
      speakerId: players[0]._id,
      content:
        'As you travel along the Triboar Trail, the dense forest suddenly erupts with activity. Four goblins spring from the undergrowth, their crude weapons raised. Roll for initiative!',
      timestamp: new Date(sessions[0].date.getTime() + 45 * 60 * 1000),
      duration: 30,
      confidence: 0.98,
      type: 'narration',
      tags: ['combat-start', 'ambush'],
      segment: {
        index: 1,
        startTime: 2700,
        endTime: 2730,
      },
    },

    // Lost Mines Session 2 Transcriptions
    {
      sessionId: sessions[1]._id,
      speakerId: players[0]._id,
      content:
        'The goblin cave mouth yawns before you, dark and foreboding. The stench of unwashed bodies and spoiled food wafts from within. Two crude wooden posts flank the entrance, decorated with warnings written in goblin tongue.',
      timestamp: new Date(sessions[1].date.getTime() + 10 * 60 * 1000),
      duration: 40,
      confidence: 0.96,
      type: 'narration',
      tags: ['location-description', 'atmosphere'],
      segment: {
        index: 0,
        startTime: 600,
        endTime: 640,
      },
    },
    {
      sessionId: sessions[1]._id,
      speakerId: players[0]._id,
      content:
        "Yeemik, the goblin leader, stands atop a natural rock shelf, holding a bound human hostage near the edge. 'Drop weapons!' he shrieks in broken Common, 'Or human takes long fall!'",
      timestamp: new Date(sessions[1].date.getTime() + 60 * 60 * 1000),
      duration: 35,
      confidence: 0.94,
      type: 'narration',
      tags: ['npc-dialogue', 'tension'],
      segment: {
        index: 1,
        startTime: 3600,
        endTime: 3635,
      },
    },

    // Curse of Strahd Session 1 Transcriptions
    {
      sessionId: sessions[2]._id,
      speakerId: players[4]._id, // Second DM
      content:
        'The mists grow thicker as your wagon travels deeper into the forest. The air grows cold, and an unsettling silence falls over the woods. Even the horses seem nervous, their hooves clopping against the increasingly muddy road.',
      timestamp: new Date(sessions[2].date.getTime() + 15 * 60 * 1000),
      duration: 42,
      confidence: 0.97,
      type: 'narration',
      tags: ['atmosphere', 'setting-introduction'],
      segment: {
        index: 0,
        startTime: 900,
        endTime: 942,
      },
    },
    {
      sessionId: sessions[2]._id,
      speakerId: players[4]._id,
      content:
        'Suddenly, howls pierce the silence. Through the mist, you see several pairs of glowing red eyes. The wolves emerge from the fog, their matted fur dark and their fangs gleaming in the dim light.',
      timestamp: new Date(sessions[2].date.getTime() + 55 * 60 * 1000),
      duration: 38,
      confidence: 0.95,
      type: 'narration',
      tags: ['combat-start', 'horror'],
      segment: {
        index: 1,
        startTime: 3300,
        endTime: 3338,
      },
    },

    // Curse of Strahd Session 2 Transcriptions
    {
      sessionId: sessions[3]._id,
      speakerId: players[4]._id,
      content:
        'The village lies in ruins. Smoke rises from several buildings, and the screams of the villagers echo through the streets. The bandits pour through the gates, their torches casting dancing shadows on the walls.',
      timestamp: new Date(sessions[3].date.getTime() + 20 * 60 * 1000),
      duration: 36,
      confidence: 0.96,
      type: 'narration',
      tags: ['combat', 'atmosphere'],
      segment: {
        index: 0,
        startTime: 1200,
        endTime: 1236,
      },
    },
    {
      sessionId: sessions[3]._id,
      speakerId: players[4]._id,
      content:
        "As you retreat from the burning village, the Bandit King's laughter echoes behind you. The night sky glows orange with the flames, and the weight of failure settles heavy on your shoulders.",
      timestamp: new Date(sessions[3].date.getTime() + 90 * 60 * 1000),
      duration: 34,
      confidence: 0.98,
      type: 'narration',
      tags: ['defeat', 'atmosphere'],
      segment: {
        index: 1,
        startTime: 5400,
        endTime: 5434,
      },
    },
  ]);

  console.log('📝 Created transcriptions');
  return transcriptions;
}
