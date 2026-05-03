"use client";

import { MobileHeader } from "@/components/layout/mobile-header";

interface Reservation {
  id: string;
  lotName: string;
  slotCode: string;
  date: string;
  time: string;
  status: "active" | "completed" | "cancelled";
  price: number;
  currency: string;
}

// Mock reservations data
const mockReservations: Reservation[] = [
  {
    id: "res-001",
    lotName: "Torre Norte - Principal",
    slotCode: "B-24",
    date: "Hoy",
    time: "14:30 - 18:30",
    status: "active",
    price: 100,
    currency: "MXN",
  },
  {
    id: "res-002",
    lotName: "Edificio Central",
    slotCode: "A-12",
    date: "Ayer",
    time: "09:00 - 13:00",
    status: "completed",
    price: 60,
    currency: "MXN",
  },
  {
    id: "res-003",
    lotName: "Plaza Comercial Sur",
    slotCode: "C-08",
    date: "15 Abr",
    time: "16:00 - 19:00",
    status: "completed",
    price: 36,
    currency: "MXN",
  },
];

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    completed: "bg-foreground/10 text-foreground/60",
    cancelled: "bg-red-100 text-red-700",
  };

  const labels = {
    active: "Activa",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <div className="bg-background border border-foreground/10 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{reservation.lotName}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-foreground/60">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span>Lugar {reservation.slotCode}</span>
          </div>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      {/* Details */}
      <div className="flex items-center justify-between pt-3 border-t border-foreground/5">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground/70">{reservation.date}</span>
          <div className="flex items-center gap-1 text-foreground/60">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{reservation.time}</span>
          </div>
        </div>
        <span className="font-semibold">
          ${reservation.price} {reservation.currency}
        </span>
      </div>

      {/* Actions for active reservations */}
      {reservation.status === "active" && (
        <div className="flex gap-2 pt-2">
          <button className="flex-1 py-2 px-4 text-sm font-medium text-foreground/70 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors">
            Ver detalles
          </button>
          <button className="flex-1 py-2 px-4 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
            Extender tiempo
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReservationsPage() {
  const activeReservations = mockReservations.filter(r => r.status === "active");
  const pastReservations = mockReservations.filter(r => r.status !== "active");

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader
        title="Mis reservas"
        subtitle="Gestiona tus estacionamientos"
      />

      <div className="px-4 py-6 space-y-8">
        {/* Active reservations */}
        {activeReservations.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wide mb-3">
              Reservas activas
            </h2>
            <div className="space-y-3">
              {activeReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </section>
        )}

        {/* Past reservations */}
        {pastReservations.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-foreground/60 uppercase tracking-wide mb-3">
              Historial
            </h2>
            <div className="space-y-3">
              {pastReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {mockReservations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-foreground/5 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-8 h-8 text-foreground/30" />
            </div>
            <h3 className="font-medium text-foreground/70">Sin reservas</h3>
            <p className="text-sm text-foreground/50 mt-1">
              Tus reservas apareceran aqui
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
