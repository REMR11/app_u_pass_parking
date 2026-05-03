import type { Building } from "@/domain/parking/types";

/**
 * Capa de datos en memoria para el módulo inicial.
 * Sustituir por repositorio Prisma/Drizzle + API externa sin cambiar contratos del dominio.
 */
const seed: Building[] = [
  {
    id: "bld-001",
    name: "Torre Norte",
    address: "Av. Principal 100",
    totalSlots: 120,
    availableSlotsApprox: 14,
  },
  {
    id: "bld-002",
    name: "Edificio Central",
    address: "Calle Secundaria 45",
    totalSlots: 80,
    availableSlotsApprox: 3,
  },
];

export function listBuildings(): Building[] {
  return [...seed];
}

export function getBuildingById(id: string): Building | undefined {
  return seed.find((b) => b.id === id);
}
