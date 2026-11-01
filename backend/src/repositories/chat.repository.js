import { db } from "../config/database.js";

export const chatRepository = {
  async createConversation({ userId, title }) {
    const [conversation] = await db.query(
      "INSERT INTO conversations (user_id, title) VALUES (?, ?)",
      [userId, title],
    );
    return conversation.insertId;
  },
  async findConversationById({ id }) {
    const [conversation] = await db.query(
      "SELECT * FROM conversations WHERE id = ?",
      [id],
    );
    return conversation[0] || null;
  },
  async findConversationsByUser({ userId }) {
    const [conversations] = await db.query(
      "SELECT id, title, created_at FROM conversations WHERE user_id = ? ORDER BY id DESC",
      [userId],
    );
    return conversations;
  },
  async addMessage({ conversationId, role, content, sources }) {
    await db.query(
      "INSERT INTO messages (conversation_id, role, content, sources) VALUES (?, ?, ?, ?)",
      [
        conversationId,
        role,
        content,
        sources?.length !== 0 ? JSON.stringify(sources) : null,
      ],
    );
  },
  async findMessages({ conversationId }) {
    const [messages] = await db.query(
      "SELECT id, role, content, sources, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC",
      [conversationId],
    );
    return messages;
  },
  async findRecentMessages({ conversationId, limit }) {
    const [messages] = await db.query(
      "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?",
      [conversationId, limit],
    );
    return messages.reverse();
  },
};
