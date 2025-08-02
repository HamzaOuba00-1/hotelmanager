import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMyHotel, updateMyHotel, uploadLogo } from "../../../api/hotelApi";
import { hotelConfigSchema, type HotelConfigForm } from "./HotelConfigrComponents/schemas";
import HotelGeneralInfoCard from "./HotelConfigrComponents/HotelGeneralInfoCard";
import HotelStructureCard from "./HotelConfigrComponents/HotelStructureCard";
import HotelServicesCard from "./HotelConfigrComponents/HotelServicesCard";
import HotelScheduleCard from "./HotelConfigrComponents/HotelScheduleCard";
import HotelPolicyCard from "./HotelConfigrComponents/HotelPolicyCard";
import HotelSecurityCard from "./HotelConfigrComponents/HotelSecurityCard";
import useUnsavedChangesPrompt from "../../../hooks/useUnsavedChangesPrompt";
import type { Resolver } from "react-hook-form";

export default function HotelConfigPage() {
  const [hotelData, setHotelData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<HotelConfigForm | null>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const form = useForm<HotelConfigForm>({
    resolver: zodResolver(hotelConfigSchema) as Resolver<HotelConfigForm>,
    defaultValues: {
      name: "",
      services: {
        hasRestaurant: false,
        hasLaundry: false,
        hasShuttle: false,
        hasGym: false,
        hasPool: false,
        hasBusinessCenter: false,
      },
      petsAllowed: false,
      active: true,
    },
    mode: "onChange",
  });

  const { formState } = form;
  useUnsavedChangesPrompt(formState.isDirty);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const hotel = await getMyHotel();
        console.log("Hotel récupéré :", hotel);
        setHotelData(hotel);
        form.reset(hotel);
      } catch (error) {
        console.error("Erreur lors de la récupération de l’hôtel :", error);
        setToast({ type: "error", message: "Impossible de charger les données de l'hôtel" });
      }
    };

    fetchHotel();
  }, []);

  // ✅ Enregistre après confirmation
  const confirmSave = async () => {
    if (!pendingValues) return;

    try {
      const merged = { ...hotelData, ...pendingValues };
      console.log("📦 Données envoyées au backend :", merged);

      const saved = await updateMyHotel(merged);
      setHotelData(saved);
      form.reset(saved);
      setShowConfirmModal(false);

      setToast({ type: "success", message: "Configuration enregistrée avec succès ✅" });
    } catch (err) {
      console.error("❌ Erreur d'enregistrement :", err);
      setToast({ type: "error", message: "Erreur lors de l'enregistrement ❌" });
    }
  };

  // 📌 Quand on soumet, on ouvre la modal
  const onSubmit = form.handleSubmit(
    async (values) => {
      setPendingValues(values);
      setShowConfirmModal(true);
    },
    (errors) => {
      console.error("⛔ Erreurs de validation Zod :", errors);
    }
  );

  const onLogoSelected = async (file: File) => {
    const url = await uploadLogo(file);
    form.setValue("logoUrl", url, { shouldDirty: true });
  };

  // 🔔 Auto-hide toast après 3s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-semibold">Configuration de l'hôtel</h1>
      <form
        onSubmit={onSubmit}
        onInvalid={() => console.log("⛔ Formulaire invalide")}
        className="grid gap-6"
      >
        <HotelGeneralInfoCard form={form} onLogoSelected={onLogoSelected} />
        <HotelStructureCard form={form} />
        <HotelServicesCard form={form} />
        <HotelScheduleCard form={form} />
        <HotelPolicyCard form={form} />
        <HotelSecurityCard form={form} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 rounded border"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            onClick={() => console.log("🖱️ Bouton Enregistrer cliqué")}
            className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </form>

      {/* 🌟 Modal de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirmer l'enregistrement
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir enregistrer les modifications apportées à la configuration de l'hôtel ?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Toast notifications */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white animate-slideIn
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* 🎨 Animations */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes slideIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slideIn {
  animation: slideIn 0.4s ease-out;
}
`;
document.head.appendChild(style);
