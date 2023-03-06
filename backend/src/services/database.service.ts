import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { messages?: mongoDB.Collection; users?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  const db: mongoDB.Db = client.db(process.env.DB_NAME);
  console.log(`Successfully coonnected to databse: ${db.databaseName}`);

  try {
    const messagesCollection: mongoDB.Collection = db.collection(process.env.MESSAGES_COLLECTION_NAME as string);
    collections.messages = messagesCollection;
    console.log(`Successfully connected to collection: ${messagesCollection.collectionName}`);
  } catch {
    console.log(`Error connecting to MESSAGES collection`);
  }

  try {
    const usersCollection: mongoDB.Collection = db.collection(process.env.USERS_COLLECTION_NAME as string);
    collections.users = usersCollection;
    console.log(`Successfully connected to collection: ${usersCollection.collectionName}`);
  } catch {
    console.log(`Error connecting to users collection`);
  }
}
