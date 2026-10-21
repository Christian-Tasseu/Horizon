import { journalRepository } from '../src/repositories/journal.repository.js';
import { embeddingService } from '../src/services/embedding.service.js';
import { db } from '../src/config/database.js';

async function backfillEmbeddings() {
    const list = await journalRepository.findAllWithoutEmbedding();
    console.log(list);
    for (const entry of list) {
        const embedding = await embeddingService.embed(entry.content);
        await journalRepository.saveEmbedding({ id: entry.id, embedding });
    }
}

await backfillEmbeddings();
await db.end();