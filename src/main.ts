import moment from "moment";
import fetch from "node-fetch";
import { ApiResponse, Slot, Vaccine } from "./types";

function getRequestUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY/MM/DD");
  return `https://smcb-vac.no-q.info/api/v1/gyms/3/checkins/public-slots/area/${vaccine}/date/${dateStr}`;
}

async function getFreeSlotsForDay(date: moment.Moment, vaccine: Vaccine) {
  const requestUrl = getRequestUrl(date, vaccine);
  const response = await fetch(requestUrl, { method: "GET" });
  const result: ApiResponse = await response.json();
  const r = result.slots.filter((slot) => slot.free_spots > 0);

  return r;
}

const vaccineEntries = Object.entries(Vaccine).filter(
  ([x, y]) => typeof x === "string" && typeof y === "number"
);

function getAppointmentUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY-MM-DD");
  return `https://vac.no-q.info/impfstation-wandsbek/checkins#/${vaccine}/${dateStr}`;
}

const CHECK_DAYS_FROM_NOW = 14;

async function getSlots() {
  const allSlots: Slot[] = [];
  for (const [vaccineName, vaccineId] of vaccineEntries) {
    console.log(`Requesting Data for ${vaccineName} and id ${vaccineId}`);
    const now = moment();
    const promises = [...Array(CHECK_DAYS_FROM_NOW).keys()].map(
      async (daysFromNow) => {
        const dateToCheck = now.add(daysFromNow, "days");
        return getFreeSlotsForDay(dateToCheck, vaccineId as Vaccine).then(
          (slots) => slots.forEach((slot) => allSlots.push(slot))
        );
      }
    );
    await Promise.all(promises);
  }
  return allSlots;
}

function toLocalTime(timestamp: string) {
  return moment(timestamp).local();
}

function isInPast(checkInTime: moment.Moment): boolean {
  const now = moment().local();
  return checkInTime < now;
}

function printSlot(slot: Slot) {
  const slotLocalTime = toLocalTime(slot.slot.check_in_at);
  console.log("Vaccine:", Vaccine[slot.slot.gym_id]);
  if (isInPast(slotLocalTime)) {
    console.log("!! Slot is in the past !!");
    console.log(
      "Please reset your time to something before",
      slotLocalTime.format(),
      "and continue the booking process"
    );
  } else {
    console.log("time:", slotLocalTime.format());
  }
  console.log("link:", getAppointmentUrl(slotLocalTime, slot.slot.gym_id));
  console.log("--------");
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function soundTheFanfares() {
  while (1) {
    process.stderr.write("\x07");
    await sleep(100);
  }
}

(async () => {
  while (1) {
    const slots = await getSlots();
    if (slots.length === 0) {
      console.log("No Slots found :(");
    } else {
      console.log(`Found slots!`);
      slots.forEach((slot) => printSlot(slot));
      await soundTheFanfares();
    }
    await sleep(60000);
  }
})();
