"use client";

import type { Building } from "@/domain/parking/types";
import { useState } from "react";

type ApiResponse = { data?: { id: string; amountCents: number; currency: string; status: string; providerRef?: string } };

export function PaymentIntentForm({
  buildings,
  initialBuildingId,
}: {
  buildings: Building[];
  initialBuildingId?: string;
}) {
  const [buildingId, setBuildingId] = useState(
    initialBuildingId && buildings.some((b) => b.id === initialBuildingId)
      ? initialBuildingId
      : buildings[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("5.00");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const dollars = Number.parseFloat(amount);
    if (Number.isNaN(dollars) || dollars <= 0) {
      setError("Importe inválido");
      return;
    }
    const amountCents = Math.round(dollars * 100);
    setLoading(true);
    try {
      const res = await fetch("/api/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingId, amountCents, currency }),
      });
      const json = (await res.json()) as ApiResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Error al crear el pago");
        return;
      }
      if (json.data) {
        setResult(
          `Intención ${json.data.id} · ${(json.data.amountCents / 100).toFixed(2)} ${json.data.currency} · ${json.data.status}` +
            (json.data.providerRef ? ` · ref: ${json.data.providerRef}` : ""),
        );
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-foreground/10 p-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Edificio</span>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 outline-none ring-primary/40 focus:ring-2"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Importe</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 outline-none ring-primary/40 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Moneda (ISO)</span>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
            maxLength={3}
            className="rounded-lg border border-foreground/15 bg-background px-3 py-2 outline-none ring-primary/40 focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !buildingId}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creando…" : "Crear intención de pago"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {result ? <p className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm">{result}</p> : null}
    </div>
  );
}
