export enum ContractType {
  ECC = 'ECC',
  PSC = 'PSC',
}

export enum ContractStatus {
  Active = 'Activo',
  Completed = 'Completado',
  OnHold = 'En Pausa',
  Cancelled = 'Cancelado',
}

export interface Contract {
  // Core Fields (from initial setup)
  id: string; // CUI can be used here
  contractType: ContractType;
  packageName: string;
  contractor: string;
  educationalInstitution: string;
  cui: string;
  
  // New Detailed Fields from Image
  montoContratoOriginal: number;
  montoContratoActualizado: number;
  periodoVigente: string; // e.g., "12 meses"
  enlaceContratoAdendas: string;
  avanceEjecucion: number; // Percentage
  ultimaValorizacion: string; // Date
  periodoPago: string; // e.g., "Mensual"
  documentoInternoConformidad: string;
  factura: string;
  fechaPresentacionFactura: string; // Date
  fechaVencimientoPago: string; // Date
  eSinad: string;
  enlaceDocumentosValorizaciones: string;
  garantiasFielCumplimiento: string;
  porcentajePrecioContrato: number; // Percentage
  acumuladoRetencionGarantia: number;
  enlaceGarantiasReportes: string;

  // Simplified fields for table/dashboard (can be derived or kept for simplicity)
  totalAmount: number; // Can be montoContratoActualizado
  executionProgress: number; // Can be avanceEjecucion
  startDate: string;
  endDate: string;
  status: ContractStatus;
}

export type ContractFilter = {
  contractType?: ContractType | '';
  packageName?: string;
  contractor?: string;
  educationalInstitution?: string;
};

export type NewContract = Omit<Contract, 'id' | 'status'>;