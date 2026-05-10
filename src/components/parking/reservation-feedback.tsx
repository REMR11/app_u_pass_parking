"use client";

export function ReservationFeedback({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed left-1/2 top-0 z-[1200] w-[min(92vw,420px)] -translate-x-1/2 px-3 pt-safe animate-in fade-in duration-200"
    >
      <div className="mt-3 rounded-2xl border border-success/30 bg-success/15 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
