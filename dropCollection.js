// dropCollection.js
import { DataAPIClient } from "@datastax/astra-db-ts";
import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

async function dropCollection() {
  try {
    const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
    const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

    console.log(`Dropping collection: ${ASTRA_DB_COLLECTION} ...`);

    const res = await db.dropCollection(ASTRA_DB_COLLECTION);

    console.log("Collection dropped:", res);
  } catch (err) {
    console.error("Drop collection error:", err);
  }
}

dropCollection();
