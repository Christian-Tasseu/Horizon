import { habitRepository } from "../repositories/habit.repository.js";
import { habitLogRepository } from "../repositories/habitLog.repository.js";
import { journalRepository } from "../repositories/journal.repository.js";
import { llmService } from "./llm.service.js";

const MAX_ENTRIES = 10;
const MAX_CHARS = 500;
export const summaryService = {
  async getWeekData(userId) {
    const now = new Date();
    const since = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6,
    );
    const habitsArray = await habitRepository.findAllByUser(userId);
    const logs = await habitLogRepository.findCompletedSince({
      userId,
      since,
    });
    const entriesSince = await journalRepository.findSince({ userId, since });
    const habits = [];
    const entries = [];
    for (const habit of habitsArray) {
      const createdAt = new Date(habit.created_at);
      const today = new Date();
      const creationDate = new Date(
        createdAt.getFullYear(),
        createdAt.getMonth(),
        createdAt.getDate(),
      );
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const diffDays = Math.round((todayDate - creationDate) / 86400000);
      const availableDays = Math.min(diffDays + 1, 7);
      habits.push({
        name: habit.name,
        doneDays: logs.filter((log) => log.habit_id == habit.id).length,
        availableDays: availableDays,
      });
    }
    for (const entry of entriesSince) {
      entries.push({
        id: entry.id,
        created_at: entry.created_at,
        content: entry.content,
      });
    }
    const data = { habits, entries };
    return data;
  },
  buildPrompt(habits, entries) {
    entries = entries.slice(-MAX_ENTRIES);
    entries = entries.map((entry) =>
      entry.content.length > MAX_CHARS
        ? {
            id: entry.id,
            created_at: entry.created_at,
            content: entry.content.slice(0, MAX_CHARS) + "…",
          }
        : {
            id: entry.id,
            created_at: entry.created_at,
            content: entry.content,
          },
    );
    const habitsPrompt = [];
    const entriesPrompt = [];
    if (habits.length === 0) {
      habitsPrompt.push("Aucune habitude suivie");
    } else {
      for (const habit of habits) {
        habitsPrompt.push(
          `- ${habit.name} : ${habit.doneDays} jours(s) sur ${habit.availableDays}`,
        );
      }
    }
    if (entries.length === 0) {
      entriesPrompt.push("Aucune entrée cette semaine");
    } else {
      for (const entry of entries) {
        entriesPrompt.push(`- [${entry.created_at}] ${entry.content}`);
      }
    }
    const prompt = `Rédige un bilan de la semaine.
Appuye-toi uniquement sur les données fournies.
N'invente rien.
Ne fais aucun calcul et recopie les chiffres fournis.
Les mots comme « aujourd’hui » dans une entrée se rapportent à la date de cette entrée.
Tutoie l'utilisateur.
Ne pose aucune question.
Limite ta réponse à cinq phrases maximum.

Habitudes :

${habitsPrompt.join("\n")}

Entrées de journal :

${entriesPrompt.join("\n")}

Rédige maintenant le bilan.
Cinq phrases maximum.
Tutoie l'utilisateur`;
    return prompt;
  },
  async summarizeWeek({ userId }) {
    const { habits, entries } = await summaryService.getWeekData(userId);
    if (habits.length === 0 && entries.length === 0)
      return {
        answer:
          "Je n'ai rien à résumer pour cette semaine : aucune habitude suivie et aucune entrée de journal.",
        sources: [],
      };
    const used = entries.slice(-MAX_ENTRIES);
    const prompt = summaryService.buildPrompt(habits, used);
    const answer = await llmService.generate(prompt);
    return { answer, sources: used };
  },
};
