import { generateImagePrompt } from './src/lib/services/generateImagePrompt.js';

const memory = {
  characters: [{ name: "Todd", description: "A radiant Asmere Paladin" }],
  items: [{ name: "Ancient Map", description: "A weathered map being studied by Todd" }],
  locations: [{ name: "Mysterious Cave", description: "A moss-covered cave" }],
};

const newText = "Todd enters the cave, his sword glowing faintly.";
const recentActivity = "Todd was studying an ancient map.";

console.log(generateImagePrompt(newText, recentActivity, memory));
