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
