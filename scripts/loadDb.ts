import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { GoogleGenerativeAI , TaskType  } from "@google/generative-ai";
import "dotenv/config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

console.log(">>> RUNNING loadDb.ts FROM HERE <<<");

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  GEMINI_API_KEY
} = process.env;

// Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

const f1Data = [
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

// Astra DB
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

// 768 MUST MATCH Astra DB collection
const OUTPUT_DIMENSION = 768;

async function createCollection() {
  try {
    await db.createCollection(ASTRA_DB_COLLECTION!, {
      vector: {
        dimension: OUTPUT_DIMENSION,
        metric: "dot_product",
      }
    });
    console.log("Collection created.");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("Collection already exists. Skipping...");
    } else {
      throw error;
    }
  }
}

// MAIN LOGIC
// async function loadSampleData() {
//   const collection = db.collection(ASTRA_DB_COLLECTION!);

//   for (const url of f1Data) {
//     const html = await scrapePage(url);
//     const chunks = await splitter.splitText(html);

//     for (const chunk of chunks) {
//       // -----------------------------
//       // GEMINI EMBEDDING FIXED CALL
//       // -----------------------------
//       const embedModel = genAI.getGenerativeModel({
//         model: "models/embedding-001" // correct name
//       });

//       const embedRes = await embedModel.embedContent(chunk);


//       const vector = embedRes.embedding.values;

//       if (vector.length !== OUTPUT_DIMENSION) {
//         console.log("⚠ Wrong dimension:", vector.length);
//         continue;
//       }

//       await collection.insertOne({
//         content: chunk,
//         $vector: vector,
//         url,
//       });
//     }

//     console.log(`Loaded: ${url}`);
//   }
// }
// MAIN LOGIC
async function loadSampleData() {
  const collection = db.collection(ASTRA_DB_COLLECTION!);

  const embeddingModel = genAI.getGenerativeModel({
    model: "models/text-embedding-004"
  });

  for (const url of f1Data) {
    const html = await scrapePage(url);
    const chunks = await splitter.splitText(html);

    for (const chunk of chunks) {
        const embedRes = await embeddingModel.embedContent({
        content: {
            role: "user",
            parts: [{ text: chunk }],
        },
        taskType: TaskType.RETRIEVAL_DOCUMENT
        });

        const vector = embedRes.embedding.values;


      if (vector.length !== OUTPUT_DIMENSION) {
        console.log(
          `⚠ Dimension mismatch: Expected ${OUTPUT_DIMENSION}, got ${vector.length}`
        );
        continue;
      }

      await collection.insertOne({
        content: chunk,
        $vector: vector,
        url,
      });
    }

    console.log(`Loaded: ${url}`);
  }
}

async function scrapePage(url: string): Promise<string> {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true, timeout: 90000 },
    gotoOptions: { waitUntil: "domcontentloaded", timeout: 60000 },
    evaluate: async (page, browser) => {
      const html = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return html;
    },
  });

  const raw = await loader.scrape();
  return raw.replace(/<[^>]+>/g, " ");
}

// RUN IT
createCollection().then(loadSampleData);
