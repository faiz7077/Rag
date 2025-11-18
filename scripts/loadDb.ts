import { DataAPIClient} from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader} from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { RecursiveCharacterTextSplitter, TextSplitter } from "langchain/text_splitter";
import { browser } from "process";

type SimiliratyMetric = "cosine" | "euclidean" | "dot_product";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    GEMINI_API_KEY
} = process.env;


const gemini=new GoogleGenAI({apiKey:GEMINI_API_KEY});

const f1Data=[
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://en.wikipedia.org/wiki/History_of_Formula_1",
    "https://en.wikipedia.org/wiki/List_of_Formula_1_circuits",
    "https://en.wikipedia.org/wiki/List_of_Formula_One_drivers",
    "https://en.wikipedia.org/wiki/List_of_Formula_One_grand_prix_winners",
    "https://formula1.fandom.com/wiki/Formula_1_World_Championship",
    "https://www.formula1.com/en/racing/2024.html",
    "https://www.formula1.com/en/teams.html",
    "https://www.formula1.com/en/drivers.html",
    "https://www.formula1.com/en/latest/article.f1-2024-season-preview.3s2J7nC1k9K6Ts5iMXG6k.html",

];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db=client.db(ASTRA_DB_API_ENDPOINT ,{namespace : ASTRA_DB_NAMESPACE});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:512,
    chunkOverlap:100,
});

const collection = async ( similarityMetric:SimiliratyMetric = "dot_product" ) => {
    const res = await(db.createCollection(ASTRA_DB_COLLECTION, {
        vector:{ 
            dimension: 1536,
            metric: similarityMetric
        }
    }));
    console.log("Collection created:", res);
}

const OUTPUT_DIMENSION = 1536; 

const TASK_TYPE = "RETRIEVAL_DOCUMENT";

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);

    for await (const url of f1Data) {
        const content = await scrapePage(url);
        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
           const embeddingResponse = await gemini.models.embedContent({

            model: "gemini-embedding-001", // The recommended, stable, high-performance embedding model
            contents: [{ role: "user", parts: [{ text: chunk }] }],
            config: {
                outputDimensionality: OUTPUT_DIMENSION, // Set to 1536, 768, or 3072
                taskType: TASK_TYPE, // Specify task for better retrieval
            }
        });

        // The embedding vector is located in embeddingResponse.embedding.values
        const vector = embeddingResponse.embeddings[0].values;
        await collection.insertOne({
            content: chunk,
            $vector: vector,
            url: url
        });

    }

    console.log(`Data from ${url} loaded into Astra DB.`);
  }
}

const scrapePage = async (url: string): Promise<string> => {
    const loader = new PuppeteerWebBaseLoader(url,{
        launchOptions: { 
            headless: true 
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        },  
        evaluate:async(page,browser)=>{ 
            const result = await page.evaluate(() => document.body.innerHTML);
            await browser.close();
            return result;  
        }
    })
    return (await loader.scrape())?.replace(/<[^>]+>/g, ' ') || '';
}