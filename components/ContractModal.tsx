import React, { useState, useEffect } from 'react';
import { Contract, NewContract, ContractType } from '../types.ts';
import { validateContract, ContractFormErrors } from '../utils/validation.ts';
import Modal from './ui/Modal.tsx';
import Input from './ui/Input.tsx';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract | NewContract) => void;
  contract: Contract | null;
}

// Updated to match only fields that can be edited/created. 'status' is removed as it's derived.
const initialFormData: NewContract = {
  contractType: ContractType.ECC,
  packageName: '',
  contractor: '',
  educationalInstitution: '',
  cui: '',
  montoContratoOriginal: 0,
  montoContratoActualizado: 0,
  periodoVigente: '',
  enlaceContratoAdendas: '',
  avanceEjecucion: 0,
  ultimaValorizacion: '',
  periodoPago: '',
  documentoInternoConformidad: '',
  factura: '',
  fechaPresentacionFactura: '',
  fechaVencimientoPago: '',
  eSinad: '',
  enlaceDocumentosValorizaciones: '',
  garantiasFielCumplimiento: '',
  porcentajePrecioContrato: 0,
  acumuladoRetencionGarantia: 0,
  enlaceGarantiasReportes: '',
  totalAmount: 0, // Ignored by backend, kept for type consistency
  executionProgress: 0, // Ignored by backend, kept for type consistency
  startDate: '',
  endDate: '',
};

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSave, contract }) => {
  const [formData, setFormData] = useState<Contract | NewContract>(initialFormData);
  const [errors, setErrors] = useState<ContractFormErrors>({});

  useEffect(() => {
    if (contract) {
      setFormData(contract);
    } else {
      setFormData(initialFormData);
    }
    setErrors({}); // Clear errors when modal opens or contract changes
  }, [contract, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number = value;
    if (type === 'number') {
        // Allow empty string to be temporarily in state before becoming 0
        parsedValue = value === '' ? '' : parseFloat(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
    }));
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number' && value === '') {
        setFormData(prev => ({...prev, [name]: 0}));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Coerce empty number strings to 0 before validation
    const dataToValidate = { ...formData };
    for (const key in dataToValidate) {
        const initialValue = initialFormData[key as keyof NewContract];
        if (typeof initialValue === 'number' && dataToValidate[key as keyof typeof dataToValidate] === '') {
            (dataToValidate as any)[key] = 0;
        }
    }

    const validationErrors = validateContract(dataToValidate);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSave(dataToValidate);
    }
  };
  
  const title = contract ? 'Editar Contrato' : 'Añadir Nuevo Contrato';
  
  // A small improvement: allows empty string for number inputs while typing
  const getNumberValue = (value: number | string) => {
    return value;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          {/* Section 1: Main Info */}
          <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2">Información Principal</h3>
          
          <Input label="CUI" name="cui" value={formData.cui} onChange={handleChange} error={errors.cui} required />
          <Input label="Institución Educativa" name="educationalInstitution" value={formData.educationalInstitution} onChange={handleChange} error={errors.educationalInstitution} required />
          <Input label="Contratista" name="contractor" value={formData.contractor} onChange={handleChange} error={errors.contractor} required />
          <Input label="Paquete" name="packageName" value={formData.packageName} onChange={handleChange} error={errors.packageName} required />
          <Select label="Tipo de Contrato" name="contractType" value={formData.contractType} onChange={handleChange} error={errors.contractType} required>
            {Object.values(ContractType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Input label="Periodo Vigente" name="periodoVigente" value={formData.periodoVigente} onChange={handleChange} />
          <Input label="Fecha de Inicio" name="startDate" type="date" value={formData.startDate} onChange={handleChange} error={errors.startDate} required />
          <Input label="Fecha de Fin" name="endDate" type="date" value={formData.endDate} onChange={handleChange} error={errors.endDate} required />

          {/* Section 2: Financials & Progress */}
          <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-4">Detalles Financieros y Avance</h3>

          <Input label="Monto Contrato Original (USD)" name="montoContratoOriginal" type="number" step="0.01" value={getNumberValue(formData.montoContratoOriginal)} onBlur={handleBlur} onChange={handleChange} error={errors.montoContratoOriginal} required />
          <Input label="Monto Contrato Actualizado (USD)" name="montoContratoActualizado" type="number" step="0.01" value={getNumberValue(formData.montoContratoActualizado)} onBlur={handleBlur} onChange={handleChange} error={errors.montoContratoActualizado} required />
          <Input label="Avance de Ejecución (%)" name="avanceEjecucion" type="number" min="0" max="100" value={getNumberValue(formData.avanceEjecucion)} onBlur={handleBlur} onChange={handleChange} error={errors.avanceEjecucion} required />
          
          {/* Section 3: Invoicing and Tracking */}
          <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-4">Seguimiento y Valorización</h3>
          <Input label="Última Valorización" name="ultimaValorizacion" type="date" value={formData.ultimaValorizacion} onChange={handleChange} />
          <Input label="Periodo de Pago" name="periodoPago" value={formData.periodoPago} onChange={handleChange} />
          <Input label="Factura" name="factura" value={formData.factura} onChange={handleChange} />
          <Input label="Fecha Presentación Factura" name="fechaPresentacionFactura" type="date" value={formData.fechaPresentacionFactura} onChange={handleChange} />
          <Input label="Fecha Vencimiento Pago" name="fechaVencimientoPago" type="date" value={formData.fechaVencimientoPago} onChange={handleChange} />
          <Input label="E-SINAD" name="eSinad" value={formData.eSinad} onChange={handleChange} />
          <Input label="Documento Interno (Conformidad)" name="documentoInternoConformidad" value={formData.documentoInternoConformidad} onChange={handleChange} />
          
          {/* Section 4: Guarantees & Withholdings */}
          <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-4">Garantías y Retenciones</h3>
          <Input label="Garantías de Fiel Cumplimiento" name="garantiasFielCumplimiento" value={formData.garantiasFielCumplimiento} onChange={handleChange} />
          <Input label="% del Precio del Contrato" name="porcentajePrecioContrato" type="number" min="0" step="0.01" value={getNumberValue(formData.porcentajePrecioContrato)} onBlur={handleBlur} onChange={handleChange} />
          <Input label="Acumulado Retención Garantía (USD)" name="acumuladoRetencionGarantia" type="number" step="0.01" value={getNumberValue(formData.acumuladoRetencionGarantia)} onBlur={handleBlur} onChange={handleChange} />

          {/* Section 5: Links */}
          <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-4">Enlaces de Documentación</h3>
          <Input label="Enlace Contrato y Adendas" name="enlaceContratoAdendas" value={formData.enlaceContratoAdendas} onChange={handleChange} error={errors.enlaceContratoAdendas} />
          <Input label="Enlace Documentos de Valorizaciones" name="enlaceDocumentosValorizaciones" value={formData.enlaceDocumentosValorizaciones} onChange={handleChange} error={errors.enlaceDocumentosValorizaciones} />
          <Input label="Enlace Garantías y Reportes" name="enlaceGarantiasReportes" value={formData.enlaceGarantiasReportes} onChange={handleChange} error={errors.enlaceGarantiasReportes} />
        </div>
        
        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {contract ? 'Guardar Cambios' : 'Crear Contrato'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContractModal;