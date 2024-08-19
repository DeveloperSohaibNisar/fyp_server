export const createVectorDb = async (sourceId, text) => {
  try {
    const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY;
    if (!HUGGINGFACEHUB_API_KEY)
      throw new Error(`Expected env var HUGGINGFACEHUB_API_KEY`);

    const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI;
    if (!MONGODB_ATLAS_URI)
      throw new Error(`Expected env var MONGODB_ATLAS_URI`);

    const spliter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const client = new MongoClient(MONGODB_ATLAS_URI);
    const collection = client.db("FYP").collection("vector_documents");

    const output = await spliter.createDocuments([text], [{ sourceId }]);

    await MongoDBAtlasVectorSearch.fromDocuments(
      output,
      new HuggingFaceInferenceEmbeddings({ model: "BAAI/bge-large-en-v1.5" }),
      {
        collection,
        indexName: "vector_index", // The name of the Atlas search index. Defaults to "default"
        textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
        embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
      }
    );
    await client.close();
  } catch (err) {
    throw err;
  }
};
