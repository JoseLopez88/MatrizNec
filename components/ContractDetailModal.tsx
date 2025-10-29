import React from 'react';
import { Contract } from '../types.ts';
import Modal from './ui/Modal.tsx';
import Button from './ui/Button.tsx';

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; type?: 'text' | 'currency' | 'percentage' | 'link' }> = ({ label, value, type = 'text' }) => {
  const formatValue = () => {
    if (value === null || typeof value === 'undefined' || value === '') return <span className="text-gray-500">N/A</span>;
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
      case 'percentage':
        return `${value}%`;
      case 'link':
        // Ensure the link has a protocol for security and functionality
        let href = String(value);
        if (!/^https?:\/\//i.test(href)) {
          href = `https://${href}`;
        }
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{value}</a>;
      default:
        return String(value);
    }
  };

  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{formatValue()}</dd>
    </div>
  );
};

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ isOpen, onClose, contract }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Contrato: ${contract.cui}`}>
        <div>
            {/* General Information */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Información General</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <DetailItem label="CUI" value={contract.cui} />
                <DetailItem label="Institución Educativa" value={contract.educationalInstitution} />
                <DetailItem label="Contratista" value={contract.contractor} />
                <DetailItem label="Tipo de Contrato" value={contract.contractType} />
                <DetailItem label="Paquete" value={contract.packageName} />
                <DetailItem label="Estado" value={contract.status} />
                <DetailItem label="Periodo Vigente" value={contract.periodoVigente} />
                <DetailItem label="Fecha de Inicio" value={contract.startDate} />
                <DetailItem label="Fecha de Fin" value={contract.endDate} />
            </dl>

            {/* Financial Information */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-6">Información Financiera</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <DetailItem label="Monto Contrato Original" value={contract.montoContratoOriginal} type="currency" />
                <DetailItem label="Monto Contrato Actualizado" value={contract.montoContratoActualizado} type="currency" />
                <DetailItem label="Factura" value={contract.factura} />
                <DetailItem label="Fecha Presentación Factura" value={contract.fechaPresentacionFactura} />
                <DetailItem label="Fecha Vencimiento Pago" value={contract.fechaVencimientoPago} />
                <DetailItem label="Periodo de Pago" value={contract.periodoPago} />
            </dl>

            {/* Execution Tracking */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-6">Seguimiento de Ejecución</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <DetailItem label="Avance de Ejecución" value={contract.avanceEjecucion} type="percentage" />
                <DetailItem label="Última Valorización" value={contract.ultimaValorizacion} />
                <DetailItem label="E-SINAD" value={contract.eSinad} />
                <DetailItem label="Documento Interno (Conformidad)" value={contract.documentoInternoConformidad} />
            </dl>
            
            {/* Guarantees */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-6">Garantías y Retenciones</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <DetailItem label="Garantías de Fiel Cumplimiento" value={contract.garantiasFielCumplimiento} />
                <DetailItem label="% del Precio del Contrato" value={contract.porcentajePrecioContrato} type="percentage" />
                <DetailItem label="Acumulado Retención Garantía" value={contract.acumuladoRetencionGarantia} type="currency" />
            </dl>
            
            {/* Documentation Links */}
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 mt-6">Documentación y Enlaces</h3>
            <dl className="grid grid-cols-1 gap-y-4">
                <DetailItem label="Enlace Contrato y Adendas" value={contract.enlaceContratoAdendas} type="link" />
                <DetailItem label="Enlace Documentos de Valorizaciones" value={contract.enlaceDocumentosValorizaciones} type="link" />
                <DetailItem label="Enlace Garantías y Reportes" value={contract.enlaceGarantiasReportes} type="link" />
            </dl>
        </div>
        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
          <Button type="button" variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
    </Modal>
  );
};

export default ContractDetailModal;
