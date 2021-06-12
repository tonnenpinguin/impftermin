import moment from "moment";
import fetch from "node-fetch";
import {
  getAppointmentUrl,
  isInPast,
  sleep,
  soundTheFanfares,
  toLocalTime,
} from "./helpers";
import { postSlot } from "./telegram";
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

const testSlot = {
  slot: {
    id: 2834,
    gym_id: 3,
    slot_rule_id: 111,
    check_in_at: "2021-06-11T11:00:00.000Z",
    interval: 10,
    duration: 10,
    bookings_count: 8,
    spots_count: 5,
    created_at: "2021-06-10T05:16:24.000Z",
    updated_at: "2021-06-11T11:42:54.000Z",
    public_booking_disabled: false,
  },
  free_spots: 4,
  slot_area_id: 3,
};

(async () => {
  await postSlot(testSlot);
  await postSlot(testSlot);
  await postSlot(testSlot);

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
