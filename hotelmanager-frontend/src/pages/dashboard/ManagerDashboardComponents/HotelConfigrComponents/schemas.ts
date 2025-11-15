import { z } from "zod";

export const hhmmRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
export const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;

const emptyable = <S extends z.ZodTypeAny>(schema: S) =>
  schema.or(z.string().length(0)).optional();

export const servicesSchema = z.object({
  hasRestaurant: z.boolean().default(false),
  hasLaundry: z.boolean().default(false),
  hasShuttle: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasBusinessCenter: z.boolean().default(false),
});

export const seasonSchema = z
  .object({
    from: z.string().regex(ymdRegex, "Format YYYY-MM-DD"),
    to: z.string().regex(ymdRegex, "Format YYYY-MM-DD"),
  })
  .nullable()
  .optional();

export const hotelConfigSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().optional(),

  address: emptyable(z.string().max(500)),
  phone: emptyable(z.string().max(50)),
  email: emptyable(z.string().email()),
  logoUrl: emptyable(z.string().url()),

  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  floors: z.number().int().min(0).optional().nullable(),
  roomsPerFloor: z.number().int().min(0).optional().nullable(),
  floorLabels: z.array(z.string().max(50)).optional(),
  roomTypes: z.array(z.string().max(50)).optional(),

  services: z.object({
    hasRestaurant: z.boolean(),
    hasLaundry: z.boolean(),
    hasShuttle: z.boolean(),
    hasGym: z.boolean(),
    hasPool: z.boolean(),
    hasBusinessCenter: z.boolean(),
  }),

  checkInHour: emptyable(z.string().regex(hhmmRegex)),
  checkOutHour: emptyable(z.string().regex(hhmmRegex)),
  closedDays: z.array(z.string().regex(ymdRegex)).optional(),
  highSeason: seasonSchema,
  cancellationPolicy: emptyable(z.string()),
  minAge: z.number().int().min(0).optional().nullable(),
  petsAllowed: z.boolean().default(false),
  acceptedPayments: z.array(z.string()).optional(),
  active: z.boolean(),
  pmsIntegrationUrl: emptyable(z.string().url()),
  
});

export type HotelConfigForm = z.infer<typeof hotelConfigSchema>;
