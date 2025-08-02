import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import {
  Utensils,
  WashingMachine,
  BusFront,
  Dumbbell,
  Waves,
  Briefcase,
} from "lucide-react";
import clsx from "clsx";

export default function HotelServicesCard({
  form,
}: {
  form: UseFormReturn<HotelConfigForm>;
}) {
  const { watch, setValue } = form;
  const services = watch("services") ?? {};

  const toggle = (key: keyof HotelConfigForm["services"]) => {
    setValue(`services.${key}`, !services?.[key], { shouldDirty: true });
  };

  const Card = ({
    name,
    label,
    Icon,
  }: {
    name: keyof HotelConfigForm["services"];
    label: string;
    Icon: React.ElementType;
  }) => {
    const isActive = services?.[name];

    return (
      <button
        type="button"
        onClick={() => toggle(name)}
        className={clsx(
          "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border shadow transition-all backdrop-blur-md",
          isActive
            ? "bg-emerald-500/90 border-emerald-600 text-white shadow-lg"
            : "bg-white/50 border-gray-200 text-gray-700 hover:bg-white/60"
        )}
      >
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Services disponibles
          </h2>
        </div>
      </header>

      {/* Sous-titre centré */}
      <div className="px-8 pt-4 text-sm text-gray-600 font-medium text-center">
        Sélectionnez les services disponibles dans votre établissement.
      </div>

      <div className="p-8 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card name="hasRestaurant" label="Restaurant" Icon={Utensils} />
        <Card name="hasLaundry" label="Blanchisserie" Icon={WashingMachine} />
        <Card name="hasShuttle" label="Navette" Icon={BusFront} />
        <Card name="hasGym" label="Salle de sport" Icon={Dumbbell} />
        <Card name="hasPool" label="Piscine" Icon={Waves} />
        <Card name="hasBusinessCenter" label="Business center" Icon={Briefcase} />
      </div>
    </section>
  );
}
