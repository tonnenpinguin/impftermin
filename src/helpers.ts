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
  while (1) {
    process.stderr.write("\x07");
    await sleep(100);
  }
}

function getAppointmentUrl(date: moment.Moment, vaccine: Vaccine) {
  const dateStr = date.format("YYYY-MM-DD");
  return `https://vac.no-q.info/impfstation-wandsbek/checkins#/${vaccine}/${dateStr}`;
}

export { toLocalTime, isInPast, sleep, soundTheFanfares, getAppointmentUrl };
