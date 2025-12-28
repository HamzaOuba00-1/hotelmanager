import { Bed, DoorOpen, SprayCan, Wrench, CheckCircle, ClipboardCheck, RefreshCw,DoorClosed, PowerOff } from "lucide-react";

export const ROOM_STATE = {
  LIBRE: "LIBRE",
  RESERVEE: "RESERVEE",
  CHECKIN: "CHECKIN",
  ROOM_SERVICE: "ROOM_SERVICE",
  CHECKOUT: "CHECKOUT",
  A_VALIDER_LIBRE: "A_VALIDER_LIBRE",
  A_NETTOYER: "A_NETTOYER",
  EN_NETTOYAGE: "EN_NETTOYAGE",
  A_VALIDER_CLEAN: "A_VALIDER_CLEAN",
  MAINTENANCE: "MAINTENANCE",
  INACTIVE: "INACTIVE",
} as const;

export type RoomState = typeof ROOM_STATE[keyof typeof ROOM_STATE];

export const STATE_OPTIONS = [
  { value: ROOM_STATE.LIBRE,           label: "Libre",             icon: DoorOpen,       color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: ROOM_STATE.RESERVEE,        label: "Réservée",          icon: ClipboardCheck, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: ROOM_STATE.CHECKIN,         label: "Check-in",          icon: Bed,            color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: ROOM_STATE.ROOM_SERVICE,    label: "Room service",      icon: DoorClosed,         color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: ROOM_STATE.CHECKOUT,        label: "Check-out",         icon: RefreshCw,      color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { value: ROOM_STATE.A_VALIDER_LIBRE, label: "À valider (libre)", icon: CheckCircle,    color: "bg-lime-50 text-lime-700 border-lime-200" },
  { value: ROOM_STATE.A_NETTOYER,      label: "À nettoyer",        icon: SprayCan,       color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: ROOM_STATE.EN_NETTOYAGE,    label: "En nettoyage",      icon: SprayCan,       color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: ROOM_STATE.A_VALIDER_CLEAN, label: "À valider (clean)", icon: CheckCircle,    color: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: ROOM_STATE.MAINTENANCE, label: "Maintenance", icon: Wrench, color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  { value: ROOM_STATE.INACTIVE,    label: "Inactive",    icon: PowerOff, color: "bg-red-100 text-red-500 border-red-300" },
] as const;

export const ALLOWED: Record<RoomState, RoomState[]> = {
  [ROOM_STATE.LIBRE]:           [ROOM_STATE.RESERVEE, ROOM_STATE.CHECKIN,ROOM_STATE.INACTIVE, ROOM_STATE.MAINTENANCE],
  [ROOM_STATE.RESERVEE]:        [ROOM_STATE.CHECKIN, ROOM_STATE.A_VALIDER_LIBRE, ROOM_STATE.LIBRE],
  [ROOM_STATE.CHECKIN]:         [ROOM_STATE.ROOM_SERVICE, ROOM_STATE.CHECKOUT],

  [ROOM_STATE.CHECKOUT]:        [ROOM_STATE.A_VALIDER_LIBRE, ROOM_STATE.A_NETTOYER],

  [ROOM_STATE.A_NETTOYER]:      [ROOM_STATE.EN_NETTOYAGE],
  [ROOM_STATE.EN_NETTOYAGE]:    [ROOM_STATE.A_VALIDER_CLEAN],
  [ROOM_STATE.A_VALIDER_CLEAN]: [ROOM_STATE.LIBRE, ROOM_STATE.A_NETTOYER],

  [ROOM_STATE.ROOM_SERVICE]:    [ROOM_STATE.CHECKIN, ROOM_STATE.CHECKOUT],

  [ROOM_STATE.A_VALIDER_LIBRE]: [ROOM_STATE.CHECKIN, ROOM_STATE.A_NETTOYER],
  [ROOM_STATE.MAINTENANCE]:     [ROOM_STATE.LIBRE],
  [ROOM_STATE.INACTIVE]:        [ROOM_STATE.LIBRE],
};
