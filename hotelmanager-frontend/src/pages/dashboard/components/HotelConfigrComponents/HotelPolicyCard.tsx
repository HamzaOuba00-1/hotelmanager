import {UseFormReturn} from "react-hook-form";
import type {HotelConfigForm} from "./schemas";
import {Ban, Check, CreditCard, FileText, PawPrint, User,} from "lucide-react";
import clsx from "clsx";

const paymentOptions = [
    "Carte bancaire",
    "Visa",
    "Mastercard",
    "American Express",
    "Espèces",
    "Apple Pay",
    "Google Pay",
    "PayPal",
    "Virement bancaire",
];

export default function HotelPolicyCard({
                                            form,
                                        }: {
    form: UseFormReturn<HotelConfigForm>;
}) {
    const {register, watch, setValue} = form;
    const payments = watch("acceptedPayments") ?? [];
    const petsAllowed = watch("petsAllowed");

    const togglePayment = (method: string) => {
        const exists = payments.includes(method);
        const updated = exists
            ? payments.filter((p) => p !== method)
            : [...payments, method];
        setValue("acceptedPayments", updated, {shouldDirty: true});
    };

    return (
        <section
            className="rounded-xl border border-gray-100 bg-white/70 shadow-xl backdrop-blur-md transition-all duration-300">
            <header
                className="bg-gradient-to-r from-emerald-500/80 to-emerald-700/70 text-white px-8 py-5 rounded-t-xl shadow backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-white"/>
                    <h2 className="text-lg font-semibold tracking-wide uppercase">
                        Politique interne
                    </h2>
                </div>
            </header>

            <div className="p-8 grid gap-8">
                {/* Politique d'annulation */}
                <label className="grid gap-2 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-emerald-500"/>
                        Politique d'annulation
                    </div>
                    <textarea
                        rows={4}
                        placeholder="Indiquez ici les conditions d'annulation…"
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                        {...register("cancellationPolicy")}
                    />
                </label>

                {/* Âge minimum + animaux */}
                <div className="grid md:grid-cols-2 gap-6 items-end">
                    <label className="grid gap-2 text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-500"/>
                            Âge minimum requis
                        </div>
                        <input
                            type="number"
                            placeholder="ex: 18"
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm bg-white/60 backdrop-blur-sm text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            {...register("minAge", {valueAsNumber: true})}
                        />
                    </label>

                    <div className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4 text-emerald-500"/>
                                Animaux acceptés
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setValue("petsAllowed", !petsAllowed, {shouldDirty: true})
                                }
                                className={clsx(
                                    "w-12 h-6 rounded-full relative transition-all duration-300",
                                    petsAllowed ? "bg-emerald-500" : "bg-gray-300"
                                )}
                            >
                <span
                    className={clsx(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transform transition-all duration-300",
                        petsAllowed && "translate-x-6"
                    )}
                />
                            </button>
                        </div>

                        <div
                            className={clsx(
                                "text-xs font-semibold w-max px-3 py-1 rounded-full shadow transition",
                                petsAllowed
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-500"
                            )}
                        >
                            {petsAllowed ? "Animaux acceptés" : "Animaux non acceptés"}
                        </div>
                    </div>
                </div>

                {/* Moyens de paiement */}
                <div className="grid gap-2 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-emerald-500"/>
                        Moyens de paiement acceptés
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {paymentOptions.map((method) => {
                            const selected = payments.includes(method);
                            return (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => togglePayment(method)}
                                    className={clsx(
                                        "flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition shadow-sm",
                                        selected
                                            ? "bg-emerald-500 text-white border-emerald-600"
                                            : "bg-white/60 border-gray-300 text-gray-700 hover:bg-white"
                                    )}
                                >
                                    {selected && <Check className="w-4 h-4"/>}
                                    {method}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
