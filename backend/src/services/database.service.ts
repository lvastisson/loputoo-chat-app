import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { messages?: mongoDB.Collection; users?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING as string);
  await client.connect();
  const db: mongoDB.Db = client.db(process.env.DB_NAME);
  console.log(`Loodud ühendus andmebaasiga: ${db.databaseName}`);

  try {
    const messagesCollection: mongoDB.Collection = db.collection("messages");
    collections.messages = messagesCollection;
    console.log(`Loodud ühendus kollektsiooniga: ${messagesCollection.collectionName}`);
  } catch {
    console.log(`Error ühendamisel MESSAGES kollektsiooniga`);
  }

  try {
    const usersCollection: mongoDB.Collection = db.collection("users");
    collections.users = usersCollection;
    console.log(`Loodud ühendus kollektsiooniga: ${usersCollection.collectionName}`);
  } catch {
    console.log(`Error ühendamisel USERS kolletsiooniga`);
  }
}
