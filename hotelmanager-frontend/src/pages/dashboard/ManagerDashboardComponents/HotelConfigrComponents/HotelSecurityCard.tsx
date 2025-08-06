import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import type { HotelConfigForm } from "./schemas";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

export default function HotelSecurityCard({
  form,
}: {
  form: UseFormReturn<HotelConfigForm>;
}) {
  const { register, watch, setValue } = form;
  const isActive = watch("active");

  // Par défaut, code flouté
  const [showCode, setShowCode] = useState(false);

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
      <header className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-white" />
          <h2 className="text-lg font-semibold tracking-wide uppercase">
            Sécurité & Accès
          </h2>
        </div>
      </header>

      <div className="p-8 grid gap-8">
        {/* Toggle actif */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">Hôtel actif</span>
            <button
              type="button"
              onClick={() => setValue("active", !isActive, { shouldDirty: true })}
              className={clsx(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                isActive ? "bg-emerald-500" : "bg-gray-300"
              )}
            >
              <span
                className={clsx(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transform transition-all duration-300",
                  isActive && "translate-x-6"
                )}
              />
            </button>
          </div>
          <div
            className={clsx(
              "text-xs font-semibold px-3 py-1 rounded-full shadow transition",
              isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
            )}
          >
            {isActive ? "Hôtel actif" : "Hôtel désactivé"}
          </div>
        </div>

        {/* Code de l'hôtel */}
        <div className="grid gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4 text-emerald-500" />
            Code de l'hôtel
          </label>
          <div className="relative">
            <input
              type={showCode ? "text" : "password"}
              {...register("code")}
              className="w-full rounded-md border px-4 py-2 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
