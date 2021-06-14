import { TELEGRAM_API_KEY, TELEGRAM_CHAT_ID } from "./config";
import fetch from "node-fetch";
import { getAppointmentUrl, log, toLocalTime } from "./helpers";
import { Slot } from "./types";
import { slotAlreadySent, storeSlotSent } from "./db";

function getUrl(message: string) {
  return `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}`;
}

function buildMessage(slot: Slot) {
  const slotLocalTime = toLocalTime(slot.checkInAt);

  const msg = `Found slot for ${slot.vaccine.name} with ${
    slot.freeSpots
  } free spots on ${slotLocalTime.format("DD.MM.YY")} at ${slotLocalTime.format(
    "HH:mm"
  )}. Book here: ${getAppointmentUrl(slotLocalTime, slot.vaccine)}`;
  return encodeURI(msg).replace(/#/g, "%23");
}

async function postMessage(url: string) {
  const response = await fetch(url, { method: "GET" });
  return response.json();
}

export async function postSlot(slot: Slot) {
  if (slotAlreadySent(slot.id)) {
    log("Slot already sent to telegram");
    return;
  }
  const message = buildMessage(slot);
  const url = getUrl(message);
  const response = await postMessage(url);
  log("Telegram api ok:", response.ok);
  if (response.ok) {
    log("storing slot sent");
    await storeSlotSent(slot.id);
  }
}
