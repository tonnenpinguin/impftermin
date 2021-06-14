import fetch from "node-fetch";
import moment from "moment";
import { getAppointmentUrl, isInPast, log, toLocalTime } from "./helpers";
import { Slot, Vaccine, VacLocation } from "./types";

type ApiResponse = {
  slots: {
    slot: {
      id: number;
      gym_id: number;
      check_in_at: string;
      bookings_count: number;
      spots_count: number;
      public_booking_disabled: boolean;
    };
    free_spots: number;
    slot_area_id: number;
  }[];
};

function getRequestUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY/MM/DD");
  return `https://smcb-vac.no-q.info/api/v1/gyms/${vaccine.locationId}/checkins/public-slots/area/${vaccine.id}/date/${dateStr}`;
}

async function getFreeSlotsForDay(date: moment.Moment, vaccine: Vaccine) {
  const requestUrl = getRequestUrl(date, vaccine);
  const response = await fetch(requestUrl, { method: "GET" });
  const result: ApiResponse = await response.json();
  if (!result.slots) {
    return [];
  }
  const r = result.slots.filter((slot) => slot.free_spots > 0);
  const slots: Slot[] = r.map((apiResult) => {
    const slot = apiResult.slot;
    return {
      freeSpots: apiResult.free_spots,
      bookingsCount: slot.bookings_count,
      checkInAt: slot.check_in_at,
      id: slot.id,
      vaccine: vaccine,
      publicBookingDisabled: slot.public_booking_disabled,
      spotsCount: slot.spots_count,
    };
  });
  return slots;
}

const CHECK_DAYS_FROM_NOW = 7;

async function getSlotsForLocation(location: VacLocation) {
  const allSlots: Slot[] = [];
  await Promise.all(
    location.vaccines.map(async (vaccine) => {
      log(
        `[${location.name}] Requesting Data for ${vaccine.name} and id ${vaccine.id}`
      );
      const now = moment();
      const promises = [...Array(CHECK_DAYS_FROM_NOW).keys()].map(
        (daysFromNow) => {
          const dateToCheck = now.add(daysFromNow, "days");
          return getFreeSlotsForDay(dateToCheck, vaccine);
        }
      );
      const slots = await Promise.all(promises);
      slots.flat().forEach((slot) => allSlots.push(slot));
    })
  );

  return allSlots;
}

export async function getAllSlots(locations: VacLocation[]) {
  const allSlots: Slot[] = [];

  await Promise.all(
    locations.map(async (location) => {
      const slots = await getSlotsForLocation(location);
      slots.forEach((slot) => allSlots.push(slot));
    })
  );
  return allSlots;
}

export function printSlot(slot: Slot) {
  const slotLocalTime = toLocalTime(slot.checkInAt);
  log("Vaccine:", slot.vaccine.name);
  if (isInPast(slotLocalTime)) {
    log("!! Slot is in the past !!");
    log(
      "Please reset your time to something before",
      slotLocalTime.format(),
      "and continue the booking process"
    );
  } else {
    log("time:", slotLocalTime.format());
  }
  log("link:", getAppointmentUrl(slotLocalTime, slot.vaccine));
  log("--------");
}
