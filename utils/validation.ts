import { Contract, NewContract } from '../types.ts';

export type ContractFormErrors = {
  [K in keyof (NewContract | Contract)]?: string;
};

const isValidUrl = (urlString: string): boolean => {
  try {
    let urlToTest = urlString.trim();
    if (!urlToTest) return true; // Optional field, valid if empty

    // Prepend 'https://' if no protocol is present to validate domain-like strings.
    if (!/^https?:\/\//i.test(urlToTest)) {
      urlToTest = `https://${urlToTest}`;
    }
    new URL(urlToTest);
    return true;
  } catch (e) {
    return false;
  }
};

export const validateContract = (contract: Partial<Contract | NewContract>): ContractFormErrors => {
  const errors: ContractFormErrors = {};

  if (!contract.cui?.trim()) {
    errors.cui = 'El CUI es requerido.';
  }
  if (!contract.packageName?.trim()) {
    errors.packageName = 'El nombre del paquete es requerido.';
  }
  if (!contract.contractor?.trim()) {
    errors.contractor = 'El contratista es requerido.';
  }
  if (!contract.educationalInstitution?.trim()) {
    errors.educationalInstitution = 'La institución educativa es requerida.';
  }
  if (!contract.contractType) {
    errors.contractType = 'El tipo de contrato es requerido.';
  }
   if (contract.montoContratoOriginal === undefined || contract.montoContratoOriginal < 0) {
    errors.montoContratoOriginal = 'El monto original debe ser un número positivo.';
  }
  if (contract.montoContratoActualizado === undefined || contract.montoContratoActualizado < 0) {
    errors.montoContratoActualizado = 'El monto actualizado debe ser un número positivo.';
  }
  if (contract.avanceEjecucion === undefined || contract.avanceEjecucion < 0 || contract.avanceEjecucion > 100) {
    errors.avanceEjecucion = 'El avance debe estar entre 0 y 100.';
  }
  if (!contract.startDate) {
    errors.startDate = 'La fecha de inicio es requerida.';
  }
  if (!contract.endDate) {
    errors.endDate = 'La fecha de fin es requerida.';
  } else if (contract.startDate && contract.endDate < contract.startDate) {
    errors.endDate = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
  }
  
  // URL validation for link fields
  if (contract.enlaceContratoAdendas && !isValidUrl(contract.enlaceContratoAdendas)) {
    errors.enlaceContratoAdendas = 'Por favor, ingrese una URL válida.';
  }
  
  if (contract.enlaceDocumentosValorizaciones && !isValidUrl(contract.enlaceDocumentosValorizaciones)) {
    errors.enlaceDocumentosValorizaciones = 'Por favor, ingrese una URL válida.';
  }

  if (contract.enlaceGarantiasReportes && !isValidUrl(contract.enlaceGarantiasReportes)) {
    errors.enlaceGarantiasReportes = 'Por favor, ingrese una URL válida.';
  }

  return errors;
};
