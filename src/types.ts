export type Vaccine = {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  locationSlug: string;
};

export type Slot = {
  id: number;
  vaccine: Vaccine;
  checkInAt: string;
  bookingsCount: number;
  spotsCount: number;
  publicBookingDisabled: boolean;
  freeSpots: number;
};

export type VacLocation = {
  id: number;
  name: string;
  address: string;
  zip: string;
  city: string;
  country?: string;
  vaccines: Vaccine[];
};
