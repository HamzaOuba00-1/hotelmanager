import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog } from "lucide-react";
import { getMyHotel, updateMyHotel, uploadLogo } from "../api/hotelApi";
import {
  hotelConfigSchema,
  type HotelConfigForm,
} from "../components/schemas";
import HotelGeneralInfoCard from "../components/HotelGeneralInfoCard";
import HotelStructureCard from "../components/HotelStructureCard";
import HotelServicesCard from "../components/HotelServicesCard";
import HotelScheduleCard from "../components/HotelScheduleCard";
import HotelPolicyCard from "../components/HotelPolicyCard";
import HotelSecurityCard from "../components/HotelSecurityCard";
import useUnsavedChangesPrompt from "../../../shared/hooks/useUnsavedChangesPrompt";

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
        setToast({
          type: "error",
          message: "Unable to load hotel configuration data",
        });
      }
    };

    fetchHotel();
  }, [form]);

  const isLocked = useMemo(() => {
    const floors = hotelData?.floors;
    const roomsPerFloor = hotelData?.roomsPerFloor;
    return !!floors && !!roomsPerFloor && floors > 0 && roomsPerFloor > 0;
  }, [hotelData]);

  useEffect(() => {
    if (!hotelData) return;

    const key = `structure-info-shown-${hotelData.id ?? "me"}`;
    const alreadyShown = localStorage.getItem(key);

    if (!isLocked && !alreadyShown) {
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
        message: "Configuration successfully saved",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred while saving the configuration";

      setToast({ type: "error", message: msg });
    }
  };

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (!hotelData) return;

      const floorsChanged = values.floors !== hotelData.floors;
      const roomsChanged = values.roomsPerFloor !== hotelData.roomsPerFloor;
      const typesChanged =
        JSON.stringify(values.roomTypes ?? []) !==
        JSON.stringify(hotelData.roomTypes ?? []);

      const forbiddenChange =
        isLocked && (floorsChanged || roomsChanged || typesChanged);

      setPendingValues(values);

      if (forbiddenChange) {
        setShowStructureWarning(true);
      } else {
        setShowConfirmModal(true);
      }
    }
  );

  const onLogoSelected = async (file: File) => {
    const url = await uploadLogo(file);
    form.setValue("logoUrl", url, { shouldDirty: true });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

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
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <Cog className="h-8 w-8 text-emerald-600" />
          Hotel configuration
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Manage general information, structure, services, schedules, policies,
          and security settings.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6">
        <HotelGeneralInfoCard form={form} onLogoSelected={onLogoSelected} />
        <HotelStructureCard form={form} isLocked={isLocked} />
        <HotelServicesCard form={form} />
        <HotelScheduleCard form={form} />
        <HotelPolicyCard form={form} />
        <HotelSecurityCard form={form} />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => form.reset(hotelData)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </form>

      {showSetupInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-emerald-700 mb-4">
              Initial setup information
            </h2>
            <p className="text-gray-700 mb-4">
              The number of floors, rooms per floor, and available room types
              define the initial room setup.
            </p>
            <p className="text-gray-700 mb-6">
              Once rooms are generated, these settings will be permanently
              locked.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSetupInfo(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {showStructureWarning && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Locked structure
            </h2>
            <p className="text-gray-700 mb-6">
              Room structure can only be configured once. The following settings
              can no longer be modified:
              <br />• Number of floors
              <br />• Rooms per floor
              <br />• Available room types
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowStructureWarning(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Confirm save
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save the changes made to the hotel
              configuration?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg text-white animate-slideIn z-50 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
