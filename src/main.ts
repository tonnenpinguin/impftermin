import { log, sleep, soundTheFanfares, toLocalTime } from "./helpers";
import { getLocations } from "./locations";
import { getAllSlots, printSlot } from "./slots";
import { postSlot } from "./telegram";

function getDelayMs() {
  const MINUTE = 60000;
  return MINUTE + Math.random() * 3 * MINUTE;
}

(async () => {
  const locations = await getLocations();
  while (1) {
    const slots = await getAllSlots(locations);
    if (slots.length === 0) {
      log("No Slots found :(");
    } else {
      log(`Found slots!`);
      slots.forEach((slot) => {
        printSlot(slot);
        postSlot(slot);
      });
      soundTheFanfares();
    }
    await sleep(getDelayMs());
  }
})();
