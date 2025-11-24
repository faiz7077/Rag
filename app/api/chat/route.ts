import { NextResponse } from "next/server";
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
  GEMINI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
const collection = db.collection(ASTRA_DB_COLLECTION!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content;

    if (!lastMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    console.log("🔍 User Query:", lastMessage);

    let docContext = "";

    // ---------------------------------------------------------------
    // 1️⃣ EMBEDDING
    // ---------------------------------------------------------------
    const embeddingModel = genAI.getGenerativeModel({
      model: "models/text-embedding-004",
    });

    const embeddingRes = await embeddingModel.embedContent({
      content: { 
        role: "user", 
        parts: [{ text: lastMessage }] 
      },
      taskType: TaskType.RETRIEVAL_QUERY
    });

    const vector = embeddingRes.embedding.values;
    console.log("✅ Generated embedding vector, dimension:", vector.length);

    // ---------------------------------------------------------------
    // 2️⃣ VECTOR SEARCH IN ASTRA
    // ---------------------------------------------------------------
    const cursor = collection.find(null, {
      sort: { $vector: vector },
      limit: 5,
    });

    const docs = await cursor.toArray();
    console.log("📚 Retrieved documents from Astra DB:", docs.length);
    
    const docTexts = docs.map((d) => d.content || "");
    docContext = docTexts.join("\n\n");
    
    console.log("📄 Context length:", docContext.length, "characters");
    console.log("📄 Context preview:", docContext.substring(0, 200) + "...");

    // ---------------------------------------------------------------
    // 3️⃣ STREAMING GENERATION
    // ---------------------------------------------------------------
    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `You are an expert Formula One assistant with deep knowledge about F1 history, races, drivers, and events.

Your task is to provide detailed, accurate, and engaging answers based on the context provided from the Formula One database.
Also donot put ** before and after the years and wherever they come
CRITICAL INSTRUCTIONS:
1. ONLY use information from the CONTEXT below - do not use external knowledge
2. If the context contains relevant information, provide a comprehensive answer with specific details
3. If the context doesn't contain enough information to answer the question, politely say: "I don't have that specific information in my Formula One database. Could you ask about something else related to F1 history, races, or drivers?"
4. Cite specific facts, dates, and details from the context when available
5. Keep your tone enthusiastic and engaging - you're talking to F1 superfans!
6. If multiple relevant facts are in the context, synthesize them into a coherent narrative

--- FORMULA ONE DATABASE CONTEXT ---
${docContext}
--- END OF CONTEXT ---

USER QUESTION: ${lastMessage}

Provide your answer based solely on the context above:`;

    console.log("🚀 Starting streaming...");

    const result = await chatModel.generateContentStream(prompt);

    // Create a ReadableStream in the format useChat expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            // Format each chunk as a data stream message for useChat
            const formatted = `0:"${text.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"\n`;
            controller.enqueue(encoder.encode(formatted));
          }
          controller.close();
        } catch (error) {
          console.error("❌ Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("❌ Gemini Chat Route Error:", error);
    console.error("Error details:", error.message);
    
    return NextResponse.json(
      { error: "Gemini processing failed", details: error.message },
      { status: 500 }
    );
  }
}