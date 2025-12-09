import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { getMyHotel, updateMyHotel, uploadLogo } from "../../../api/hotelApi";
import {
  hotelConfigSchema,
  type HotelConfigForm,
} from "./HotelConfigrComponents/schemas";
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
  const [showStructureWarning, setShowStructureWarning] = useState(false);
  const [showSetupInfo, setShowSetupInfo] = useState(false);

  const [pendingValues, setPendingValues] =
    useState<HotelConfigForm | null>(null);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
        setHotelData(hotel);
        form.reset(hotel);
      } catch (error) {
        console.error("Erreur lors de la récupération de l’hôtel :", error);
        setToast({
          type: "error",
          message: "Impossible de charger les données de l'hôtel",
        });
      }
    };

    fetchHotel();
  }, [form]);

  const isLocked = useMemo(() => {
    const f = hotelData?.floors;
    const r = hotelData?.roomsPerFloor;
    return !!f && !!r && f > 0 && r > 0;
  }, [hotelData]);

  // ✅ Pop-up d’info au 1er setup
  useEffect(() => {
    if (!hotelData) return;
    const key = `structure-info-shown-${hotelData.id ?? "me"}`;
    const already = localStorage.getItem(key);

    if (!isLocked && !already) {
      setShowSetupInfo(true);
      localStorage.setItem(key, "1");
    }
  }, [hotelData, isLocked]);

  const confirmSave = async () => {
    if (!pendingValues) return;
    try {
      const merged = { ...hotelData, ...pendingValues };
      const saved = await updateMyHotel(merged);
      setHotelData(saved);
      form.reset(saved);
      setShowConfirmModal(false);
      setToast({
        type: "success",
        message: "Configuration enregistrée avec succès ✅",
      });
    } catch (err: any) {
      console.error("❌ Erreur d'enregistrement :", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'enregistrement ❌";

      setToast({ type: "error", message: msg });
    }
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (!hotelData) return;

      const floorsChanged = values.floors !== hotelData.floors;
      const rpfChanged = values.roomsPerFloor !== hotelData.roomsPerFloor;
      const typesChanged =
        JSON.stringify(values.roomTypes ?? []) !==
        JSON.stringify(hotelData.roomTypes ?? []);

      const forbiddenChange =
        isLocked && (floorsChanged || rpfChanged || typesChanged);

      setPendingValues(values);

      if (forbiddenChange) {
        setShowStructureWarning(true);
      } else {
        setShowConfirmModal(true);
      }
    },
    (errors) => {
      console.error("⛔ Erreurs de validation Zod :", errors);
    }
  );

  const onLogoSelected = async (file: File) => {
    const url = await uploadLogo(file);
    form.setValue("logoUrl", url, { shouldDirty: true });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Animations safe
  useEffect(() => {
    if (typeof document === "undefined") return;
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      @keyframes slideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .animate-slideIn { animation: slideIn 0.4s ease-out; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Header aligné sur Planning */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <Cog className="h-8 w-8 text-emerald-600" />
          Configuration de l'hôtel
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Gérez les informations générales, la structure, les services, les
          horaires, les politiques et la sécurité.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6">
        <HotelGeneralInfoCard form={form} onLogoSelected={onLogoSelected} />
        <HotelStructureCard form={form} isLocked={isLocked} />
        <HotelServicesCard form={form} />
        <HotelScheduleCard form={form} />
        <HotelPolicyCard form={form} />
        <HotelSecurityCard form={form} />

        {/* ✅ Actions harmonisées */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => form.reset(hotelData)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </form>

      {/* ✅ Pop-up INFO 1er setup */}
      {showSetupInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">
              Configuration initiale
            </h2>
            <p className="text-gray-700 mb-4">
              Le nombre d’étages, le nombre de chambres par étage et les types
              de chambres disponibles constituent le setup initial des chambres.
            </p>
            <p className="text-gray-700 mb-6">
              Une fois les chambres générées, ces paramètres seront verrouillés.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSetupInfo(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Pop-up interdit si tentative de changement */}
      {showStructureWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              ⚠️ Structure verrouillée
            </h2>
            <p className="text-gray-700 mb-6">
              Le setup des chambres se fait une seule fois.
              Les paramètres suivants ne peuvent plus être modifiés :
              <br />• Nombre d’étages
              <br />• Chambres par étage
              <br />• Types de chambres disponibles
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowStructureWarning(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal confirmation classique */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirmer l'enregistrement
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir enregistrer les modifications apportées à
              la configuration de l'hôtel ?
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white animate-slideIn z-50
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
