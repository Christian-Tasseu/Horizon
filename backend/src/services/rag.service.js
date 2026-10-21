import { journalService } from "./journal.service.js";

export const ragService = {
  buildPrompt(question, entries) {
    const prompt = "";
    const newEntries = entries
      .map(
        (entry) =>
          (entry.created_at = new Date(entry.created_at).toLocaleDateString(
            "fr-FR",
            { dateStyle: "long" },
          )),
      )
      .join("\n");
      prompt = question + newEntries
      return prompt;
  },
};
