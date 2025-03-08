import { Pinecone } from '@pinecone-database/pinecone';
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 1536; // Ensure it's a number
const indexName = process.env.PINECONE_INDEX_NAME;

// await pc.createIndex({  // Uncomment this block to create the index
//     name: indexName,
//     dimension: DIMENSIONS, // Replace with your model dimensions
//     metric: 'cosine', // Replace with your model metric
//     spec: {
//         serverless: {
//             cloud: 'aws',
//             region: 'us-east-1'
//         }
//     }
// });

export { pc, indexName };