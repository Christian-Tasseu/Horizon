import { pipeline } from "@huggingface/transformers";
import { embeddingService } from "../src//services/embedding.service.js";
import { ragService } from "../src/services/rag.service.js";

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

const entries = [
  "J'ai fait une séance de sport ce matin",
  "Entraînement de musculation ce matin",
  "J'ai préparé des pâtes pour dimanche",
  "Je me suis réveillé trois fois cette nuit, je suis épuisé",
  "Réunion avec mon équipe, la journée était longue",
];

console.log(
  ragService.buildPrompt("Question test ? ", {
    content: "Un test aléatoire",
    created_at: "2026-10-18T22:44:32.000Z",
  }),
);

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
