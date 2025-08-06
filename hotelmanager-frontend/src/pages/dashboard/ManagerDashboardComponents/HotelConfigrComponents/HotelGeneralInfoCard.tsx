import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import {
  ImagePlus,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Hotel,
  LocateFixed,
} from "lucide-react";

export default function HotelGeneralInfoCard({
  form,
  onLogoSelected,
}: {
  form: UseFormReturn<HotelConfigForm>;
  onLogoSelected: (file: File) => void;
}) {
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const logoUrl = watch("logoUrl");

  const inputClass =
    "w-full rounded-md border border-gray-300 px-4 py-2 text-sm bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

  const labelClass = "grid gap-1 text-sm font-medium text-gray-700";

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Hotel className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Informations Générales
          </h2>
        </div>
      </header>

      {/* Form Content */}
      <div className="p-8 grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-500" />
              Nom de l'hôtel
            </div>
            <input
              className={inputClass}
              {...register("name")}
              placeholder="Nom de l'hôtel"
            />
            {errors.name && (
              <small className="text-red-600 text-xs">
                {errors.name.message}
              </small>
            )}
          </label>

          {/* Téléphone */}
          <label className={labelClass}>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              Téléphone
            </div>
            <input
              className={inputClass}
              {...register("phone")}
              placeholder="+00 00 00 00 00"
            />
          </label>

          {/* Email + Adresse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-1 md:col-span-2">
            <label className={labelClass}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Email de contact
              </div>
              <input
                type="email"
                className={inputClass}
                {...register("email")}
                placeholder="exemple@hotel.com"
              />
            </label>

            <label className={labelClass}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Adresse
              </div>
              <input
                className={inputClass}
                {...register("address")}
                placeholder="123 rue de l'Excellence, Paris"
              />
            </label>
          </div>

          {/* Coordonnées GPS */}
          <label className={`${labelClass} col-span-1 md:col-span-2`}>
            <div className="flex items-center gap-2">
              <LocateFixed className="w-4 h-4 text-emerald-500" />
              Coordonnées GPS
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                className={inputClass}
                {...register("latitude", { valueAsNumber: true })}
                placeholder="Latitude ex: 48.8566"
              />
              <input
                type="number"
                step="any"
                className={inputClass}
                {...register("longitude", { valueAsNumber: true })}
                placeholder="Longitude ex: 2.3522"
              />
            </div>
          </label>
        </div>

        {/* Uploader + Logo côte à côte */}
        <div className="w-full flex justify-center mt-4">
          <div className="flex items-center justify-center gap-6">
            {/* Uploader */}
            <label className="w-64 aspect-[5/2] relative rounded-xl border-2 border-dashed border-emerald-400 bg-white/40 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 transition">
              <ImagePlus className="w-5 h-5 text-emerald-500 mb-1" />
              <span className="text-emerald-600 font-medium text-sm">
                Uploader un logo
              </span>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onLogoSelected(file);
                }}
              />
            </label>

            {/* Logo actuel */}
            <div className="w-64 aspect-[5/2] relative rounded-xl border-2 border-dashed border-gray-400 bg-white/40 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center transition">
              {logoUrl ? (
                <img
                  className="w-full h-full object-contain mb-2"
                  src={logoUrl}
                  alt="Logo actuel"
                />
              ) : (
                <span className="text-sm text-gray-500">Aucun logo encore uploadé</span>
              )}
            </div>


          </div>
        </div>

        {/* Note sous l’upload */}
        <p className="text-xs text-gray-500 text-center mt-2 leading-tight">
          Conseil : Utilisez un logo au format horizontal (5:2) et sans background pour un rendu optimal.
L’affichage dans la barre latérale est redimensionné automatiquement.
        </p>
      </div>
    </section>
  );
}
