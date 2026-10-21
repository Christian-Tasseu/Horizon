import { pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

let extractor = null;

const getExtractor = async () => {
  if (extractor === null) {
    extractor = await pipeline("feature-extraction", MODEL);
  }
  return extractor;
};

export const embeddingService = {
  async embed(text) {
    await getExtractor()
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    return Array.from(output.data)
  },
};
