import { pipeline } from "@huggingface/transformers";
import { embeddingService } from "../src//services/embedding.service.js";
import { ragService } from "../src/services/rag.service.js";
import { llmService } from "../src/services/llm.service.js";
import { summaryService } from "../src/services/summary.service.js";

const extractor = await pipeline(
  "feature-extraction",
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
);

const embed = async (text) => {
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

const distance = (vecA, vecB) => {
  let total = 0;
  for (let i = 0; i < vecA.length; i++) {
    total += (vecA[i] - vecB[i]) * (vecA[i] - vecB[i]);
  }
  return total;
};

// const entries = [
//   "J'ai fait une séance de sport ce matin",
//   "Entraînement de musculation ce matin",
//   "J'ai préparé des pâtes pour dimanche",
//   "Je me suis réveillé trois fois cette nuit, je suis épuisé",
//   "Réunion avec mon équipe, la journée était longue",
// ];


// const res = await llmService.generate(ragService.buildPrompt("Comment je dors en ce moment ?", [
//     {
//       content: "Aujourd'hui j'ai fait une séance de sport ce matin",
//       created_at: "2026-10-19T10:30:00.000Z",
//     },
//     {
//       content: "Je me suis réveillé trois fois cette nuit, je suis épuisé",
//       created_at: "2026-10-20T15:45:00.000Z",
//     },
//   ]))
// console.log(res)
// const question = "Comment je dors en ce moment ?";

// const vecQuestion = await embed(question);

// const results = [];

// for (const text of entries) {
//   const vecText = await embeddingService.embed(text);
//   results.push({ text, distance: distance(vecQuestion, vecText) });
// }

// results.sort((a, b) => a.distance - b.distance);

// const text1 = "J'ai fait une séance de sport ce matin"
// const text2 = "Entraînement de musculation ce matin"
// const text3 = "J'ai préparé des lasagnes ce matin"

// const vecA = await embed(text1)
// const vecB = await embed(text2)
// const vecC = await embed(text3)
// const vecD = await embed("I did a workout this morning")

// console.log(vecA)
// console.log("--------------------------------------------------------------------------------------------------")
// console.log(vecA.length)
// console.log("--------------------------------------------------------------------------------------------------")
// console.log(vecA.slice(0, 10))
// console.log("--------------------------------------------------------------------------------------------------")
// console.log(distance(vecA, vecB))
// console.log("--------------------------------------------------------------------------------------------------")
// console.log(distance(vecA, vecC))
// console.log("--------------------------------------------------------------------------------------------------")
// console.log(distance(vecA, vecD))


const habits = [
  {
    name: "Sport",
    doneDays: 4,
    availableDays: 7,
  },
  {
    name: "Lecture",
    doneDays: 2,
    availableDays: 5,
  },
  {
    name: "Anglais",
    doneDays: 3,
    availableDays: 7,
  },
];

const entries = [
  {
    id: 1,
    created_at: "2026-10-21T18:30:00",
    content: "J'ai fait une bonne séance de sport aujourd'hui.",
  },
  {
    id: 2,
    created_at: "2026-10-22T20:00:00",
    content: "J'ai lu pendant 30 minutes et appris de nouveaux mots.",
  },
  {
    id: 3,
    created_at: "2026-10-23T19:00:00",
    content: "J'ai eu du mal à rester concentré sur mes objectifs.",
  },
];

// Test 1 : données normales
console.log("TEST 1 : DONNÉES NORMALES");
console.log(summaryService.buildPrompt(habits, entries));

// Test 2 : 12 entrées de 800 caractères
const longEntries = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  created_at: `2026-10-${String(index + 1).padStart(2, "0")}T12:00:00`,
  content: `Entrée ${index + 1} : ` + "x".repeat(800),
}));

console.log("TEST 2 : ENTRÉES LONGUES");
console.log(summaryService.buildPrompt(habits, longEntries));

// Test 3 : tableaux vides
console.log("TEST 3 : DONNÉES VIDES");
console.log(summaryService.buildPrompt([], []));