import mongoose from "mongoose";

const LOCAL_URI =
  process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/cove_booking";

const ATLAS_URI = process.env.ATLAS_MONGODB_URI;

if (!ATLAS_URI) {
  console.error(
    "Set ATLAS_MONGODB_URI (standard mongodb:// connection string recommended if SRV DNS fails)."
  );
  process.exit(1);
}

// Session tokens are not migrated — users will log in again on production.
const COLLECTIONS = [
  "users",
  "hotels",
  "bookings",
  "reviews",
  "bookmarks",
  "wishlistshares",
  "conversations",
  "messages",
];

async function migrateCollection(localDb, atlasDb, name) {
  const docs = await localDb.collection(name).find({}).toArray();
  await atlasDb.collection(name).deleteMany({});
  if (docs.length === 0) {
    console.log(`  ${name}: 0 documents (skipped insert)`);
    return 0;
  }
  await atlasDb.collection(name).insertMany(docs, { ordered: false });
  console.log(`  ${name}: ${docs.length} documents`);
  return docs.length;
}

async function migrate() {
  const local = await mongoose.createConnection(LOCAL_URI).asPromise();
  const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();

  console.log(`Local:  ${local.name}`);
  console.log(`Atlas:  ${atlas.name}`);
  console.log("Migrating collections...");

  const totals = {};
  for (const name of COLLECTIONS) {
    totals[name] = await migrateCollection(local.db, atlas.db, name);
  }

  console.log("\nMigration complete:");
  console.log(totals);

  await local.close();
  await atlas.close();
}

migrate().catch(async (err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
