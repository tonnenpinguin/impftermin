import fetch from "node-fetch";
import { Vaccine, VacLocation } from "./types";

type ApiResponseSuccess = {
  gym: {
    id: number;
    name: string;
    address: string;
    zip: string;
    city: string;
    country?: string;
    slug: string | null;
  };
  slot_areas: {
    id: number;
    gym_id: number;
    name: string;
  }[];
};
type ApiResponseError = {
  message: string;
  code: number;
  type: string;
};
type ApiResponse = ApiResponseSuccess | ApiResponseError;

function printLocation(location: VacLocation) {
  const { id, address, zip, city, country, name } = location;
  console.log(location);
  // console.log({ id, name, zip, city, address });
  // console.log(`${id}\t${name} - ${address}\t\t${zip} ${city} ${country}`);
}

function getRequestUrl(locationId: number) {
  return `https://smcb-vac.no-q.info/api/v1/gyms/${locationId}/checkins/public`;
}

function isSuccess(response: ApiResponse): response is ApiResponseSuccess {
  return (response as ApiResponseSuccess).gym !== undefined;
}

async function getLocation(locationId: number) {
  const requestUrl = getRequestUrl(locationId);
  const response = await fetch(requestUrl, { method: "GET" });
  const result: ApiResponse = await response.json();
  if (isSuccess(result)) {
    const { gym, slot_areas } = result;

    const vaccines: Vaccine[] = slot_areas.map((vaccine) => ({
      id: vaccine.id,
      name: vaccine.name,
      locationId: vaccine.gym_id,
      locationName: gym.name,
      locationSlug: gym.slug!,
    }));

    const location: VacLocation = {
      address: gym.address,
      zip: gym.zip,
      city: gym.city,
      id: gym.id,
      name: gym.name,
      vaccines,
    };
    return location;
  }
  return undefined;
}

const MAX_LOCATION_ID = 60;
const BLACKLISTED_LOCATIONS = [
  "Praxis Dr. Alpha",
  "Praxis Dr. Gamma",
  "EDEKA Zentrale Stiftung & Co. KG",
  "Praxis Gatermann-Petersen",
];
const WHITELISTED_CITIES = ["Hamburg", "Quickborn", "Münster"];

export async function getLocations() {
  const allLocations: VacLocation[] = [];
  const promises = [...Array(MAX_LOCATION_ID).keys()].map(
    async (locationId) => {
      return getLocation(locationId).then((location) => {
        if (!location) {
          return;
        }
        if (!WHITELISTED_CITIES.some((city) => city === location.city)) {
          console.log("filtered", location.city);
          return;
        }
        if (
          BLACKLISTED_LOCATIONS.some(
            (blacklistedLocation) => blacklistedLocation === location.name
          )
        ) {
          return;
        }
        allLocations.push(location);
      });
    }
  );
  await Promise.all(promises);
  allLocations.forEach((location) => {
    printLocation(location);
  });
  return allLocations;
}
