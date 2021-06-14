import moment from "moment";
import { Vaccine } from "./types";

function toLocalTime(timestamp: string) {
  return moment(timestamp).local();
}

function isInPast(checkInTime: moment.Moment): boolean {
  const now = moment().local();
  return checkInTime < now;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function soundTheFanfares() {
  for (let i = 0; i < 3; i++) {
    process.stderr.write("\x07");
    await sleep(100);
  }
}

function getAppointmentUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY-MM-DD/HH:mm");
  return `https://vac.no-q.info/${vaccine.locationSlug}/checkins#/${vaccine.id}/${dateStr}/1`;
}

function log(...args: any[]) {
  console.log(`[${moment().local().format("HH:mm:ss")}]:`, ...args);
}

export {
  toLocalTime,
  isInPast,
  sleep,
  soundTheFanfares,
  getAppointmentUrl,
  log,
};
