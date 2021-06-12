import { dirname, join } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use JSON file for storage
const file = join(__dirname, "db.json");

type Data = {
  slotIds: number[];
};
const adapter = new JSONFile<Data>("db.json");
const db = new Low<Data>(adapter);
await db.read();
db.data ||= { slotIds: [] };

export function slotAlreadySent(slotId: number) {
  return db.data!.slotIds.some((id) => id === slotId);
}

export function storeSlotSent(slotId: number) {
  db.data!.slotIds.push(slotId);
  return db.write();
}
