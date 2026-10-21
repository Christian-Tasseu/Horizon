export const ragService = {
  buildPrompt(question, entries) {
    const newEntries = entries
      .map(
        (entry) =>
          `- [${new Date(entry.created_at).toLocaleDateString("fr-FR", {
            dateStyle: "long",
          })}] ${entry.content}`,
      )
      .join("\n");
    return `Tu es un assistant qui aide l'utilisateur à relire son journal personnel.
Réponds uniquement à partir des extraits ci-dessous. Si les extraits ne
permettent pas de répondre, dis-le clairement. N'invente rien. cite la date des extraits quand tu t'y réfères. Adresse-toi à l'utilisateur par "tu" et non par "vous".

Extraits du journal :
${newEntries}

Question : ${question}`;
  },
};
