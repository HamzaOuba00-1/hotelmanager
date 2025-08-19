/**
 * Helpers ISO 8601 (UTC) pour Spring OffsetDateTime.
 * new Date("YYYY-MM-DDTHH:mm:ss") est interprété dans le fuseau du navigateur,
 * puis .toISOString() convertit en UTC → OK pour OffsetDateTime.
 */

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function isValidYMD(dateStr: string): boolean {
  if (!YMD.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** Arrivée (défaut 15:00 local -> ISO en Z) */
export function buildStartISO(arrivalDate: string, checkInHour = 15): string {
  if (!isValidYMD(arrivalDate)) throw new Error("arrivalDate doit être YYYY-MM-DD");
  const hh = String(checkInHour).padStart(2, "0");
  const d = new Date(`${arrivalDate}T${hh}:00:00`);
  return d.toISOString();
}

/** Départ (défaut 11:00 local -> ISO en Z) */
export function buildEndISO(departureDate: string, checkOutHour = 11): string {
  if (!isValidYMD(departureDate)) throw new Error("departureDate doit être YYYY-MM-DD");
  const hh = String(checkOutHour).padStart(2, "0");
  const d = new Date(`${departureDate}T${hh}:00:00`);
  return d.toISOString();
}

/** Formats par défaut pour inputs <type="date"> */
export function defaultArrival(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
export function defaultDeparture(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}
