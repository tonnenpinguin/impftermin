import moment from "moment";
import fetch from "node-fetch";

export enum Vaccine {
  ASTRA_ZENECA = 3,
  BIONTECH = 2,
  JOHNSON = 68,
}

export type Slot = {
  slot: {
    id: number;
    gym_id: number;
    slot_rule_id: number;
    check_in_at: string;
    interval: number;
    duration: number;
    bookings_count: number;
    spots_count: number;
    created_at: string;
    updated_at: string;
    public_booking_disabled: boolean;
  };
  free_spots: number;
  slot_area_id: number;
};

export type ApiResponse = {
  slots: Slot[];
};

function getRequestUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY/MM/DD");
  return `https://smcb-vac.no-q.info/api/v1/gyms/3/checkins/public-slots/area/${vaccine}/date/${dateStr}`;
}

async function getFreeSlotsForDay(date: moment.Moment, vaccine: Vaccine) {
  const requestUrl = getRequestUrl(date, vaccine);
  const response = await fetch(requestUrl, { method: "GET" });
  const result: ApiResponse = await response.json();
  return result.slots.filter((slot) => slot.free_spots > 0);
}

const vaccineEntries = Object.entries(Vaccine).filter(
  ([x, y]) => typeof x === "string" && typeof y === "number"
);

const CHECK_DAYS_FROM_NOW = 31;

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
    //   console.log(`Checking date ${dateToCheck.toString()}`);
    //   console.log(slots);
  }
  if (allSlots.length === 0) {
    console.log("No Slots found :(");
  } else {
    console.log(`Found slots!`, allSlots);
  }
}

(async () => {
  console.log(await getSlots());
})();
