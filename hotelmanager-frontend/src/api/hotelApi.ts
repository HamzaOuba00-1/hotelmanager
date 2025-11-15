import http from "./http";

export type Services = {
  hasRestaurant: boolean;
  hasLaundry: boolean;
  hasShuttle: boolean;
  hasGym: boolean;
  hasPool: boolean;
  hasBusinessCenter: boolean;
};

export type Season = { from: string; to: string } | null | undefined;

export interface HotelConfigDTO {
  id?: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  floors?: number | null;
  roomsPerFloor?: number | null;
  floorLabels?: string[];
  roomTypes?: string[];
  services: Services;
  checkInHour?: string;
  checkOutHour?: string;
  closedDays?: string[];
  highSeason?: Season;
  cancellationPolicy?: string;
  minAge?: number | null;
  petsAllowed?: boolean;
  acceptedPayments?: string[];
  active: boolean;
}

function cleanPayload(payload: HotelConfigDTO): HotelConfigDTO {
  return {
    ...payload,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    floors: payload.floors ?? null,
    roomsPerFloor: payload.roomsPerFloor ?? null,
    minAge: payload.minAge ?? null,
    highSeason: payload.highSeason ?? null,
    floorLabels: payload.floorLabels ?? [],
    roomTypes: payload.roomTypes ?? [],
    acceptedPayments: payload.acceptedPayments ?? [],
    closedDays: payload.closedDays ?? [],
    services: payload.services ?? {
      hasRestaurant: false,
      hasLaundry: false,
      hasShuttle: false,
      hasGym: false,
      hasPool: false,
      hasBusinessCenter: false,
    },
    active: payload.active ?? true,
  };
}

export async function getMyHotel(): Promise<HotelConfigDTO> {
  const { data } = await http.get<HotelConfigDTO>("/hotels/me");
  return data;
}

export async function updateMyHotel(payload: HotelConfigDTO): Promise<HotelConfigDTO> {
  const cleaned = cleanPayload(payload);
  const { data } = await http.put<HotelConfigDTO>("/hotels/me", cleaned);
  return data;
}

export async function uploadLogo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post<{ logoUrl: string }>("/hotels/me/logo", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.logoUrl;
}

