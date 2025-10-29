import React from 'react';
import { Contract, ContractFilter, ContractType } from '../types.ts';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon.tsx';
import { FileExportIcon } from './icons/FileExportIcon.tsx';
import { FilePdfIcon } from './icons/FilePdfIcon.tsx';
import { LogoIcon } from './icons/LogoIcon.tsx';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FilterSidebarProps {
  filters: ContractFilter;
  setFilters: React.Dispatch<React.SetStateAction<ContractFilter>>;
  uniqueValues: {
    packageNames: string[];
    contractors: string[];
    institutions: string[];
  };
  contracts: Contract[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, uniqueValues, contracts }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      contractType: '',
      packageName: '',
      contractor: '',
      educationalInstitution: ''
    });
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = contracts.map(c => ({
        'CUI': c.cui || '',
        'Institución Educativa': c.educationalInstitution || '',
        'Contratista': c.contractor || '',
        'Paquete': c.packageName || '',
        'Tipo de Contrato': c.contractType || '',
        'Estado': c.status || '',
        'Avance de Ejecución (%)': c.executionProgress || 0,
        'Monto Total (USD)': c.totalAmount || 0,
        'Monto Contrato Original': c.montoContratoOriginal || 0,
        'Monto Contrato Actualizado': c.montoContratoActualizado || 0,
        'Período Vigente': c.periodoVigente || '',
        'Fecha de Inicio': c.startDate || '',
        'Fecha de Fin': c.endDate || ''
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');
      
      // Ajustar el ancho de las columnas
      const wscols = [
        { wch: 15 }, // CUI
        { wch: 30 }, // Institución
        { wch: 30 }, // Contratista
        { wch: 20 }, // Paquete
        { wch: 20 }, // Tipo de Contrato
        { wch: 15 }, // Estado
        { wch: 20 }, // Avance
        { wch: 20 }, // Monto Total
        { wch: 25 }, // Monto Original
        { wch: 25 }, // Monto Actualizado
        { wch: 20 }, // Período
        { wch: 15 }, // Inicio
        { wch: 15 }  // Fin
      ];
      worksheet['!cols'] = wscols;
      
      XLSX.writeFile(workbook, 'matriz_contratos.xlsx');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Ocurrió un error al exportar a Excel. Por favor, intente nuevamente.');
    }
  };

  const handleExportPdf = () => {
    try {
      // Crear un nuevo documento PDF en formato horizontal
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Título del documento
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text('MATRIZ DE SEGUIMIENTO DE CONTRATOS NEC4', 148.5, 15, { align: 'center' });
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 25);
      
      // Configuración de la tabla
      const headers = [
        'CUI',
        'Institución',
        'Contratista',
        'Tipo',
        'Paquete',
        'Avance %',
        'Monto (USD)'
      ];
      
      const data = contracts.map(c => ({
        cui: c.cui || '-',
        institucion: c.educationalInstitution || '-',
        contratista: c.contractor || '-',
        tipo: c.contractType || '-',
        paquete: c.packageName || '-',
        avance: c.executionProgress ? `${c.executionProgress}%` : '0%',
        monto: new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(c.totalAmount || 0)
      }));
      
      // Agregar la tabla al documento
      autoTable(doc, {
        head: [headers],
        body: data.map(item => [
          item.cui,
          item.institucion,
          item.contratista,
          item.tipo,
          item.paquete,
          item.avance,
          item.monto
        ]),
        startY: 30,
        margin: { left: 10, right: 10 },
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          lineWidth: 0.1,
          textColor: [0, 0, 0]
        },
        headStyles: { 
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 20 }, // CUI
          1: { cellWidth: 45 }, // Institución
          2: { cellWidth: 40 }, // Contratista
          3: { cellWidth: 25 }, // Tipo
          4: { cellWidth: 30 }, // Paquete
          5: { cellWidth: 20 }, // Avance
          6: { cellWidth: 25 }  // Monto
        },
        didDrawPage: function() {
          // Número de página
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.text(
            `Página ${doc.getNumberOfPages()}`,
            pageSize.width - 20,
            pageHeight - 10
          );
        }
      });
      
      // Guardar el documento
      doc.save('matriz_contratos.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <aside className={`bg-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} relative shadow-lg flex flex-col`}>
        <div className="flex items-center justify-center h-16 border-b px-4">
            <LogoIcon className={`h-8 w-8 text-blue-600 transition-all duration-300 ${isOpen && 'mr-3'}`} />
            <h1 className={`text-xl font-bold text-gray-800 whitespace-nowrap transition-opacity duration-300 ${!isOpen && 'opacity-0 scale-0'}`}>
            Matriz de Contratos
            </h1>
        </div>
      <div className={`p-4 flex-grow overflow-y-auto ${!isOpen && 'hidden'}`}>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Filtros</h2>

        <div className="space-y-5">
          <Select
            label="Tipo de Contrato"
            name="contractType"
            value={filters.contractType || ''}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {Object.values(ContractType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <Select
            label="Paquete"
            name="packageName"
            value={filters.packageName || ''}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {uniqueValues.packageNames.sort().map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>

          <Select
            label="Contratista"
            name="contractor"
            value={filters.contractor || ''}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {uniqueValues.contractors.sort().map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>

          <Select
            label="Institución Educativa"
            name="educationalInstitution"
            value={filters.educationalInstitution || ''}
            onChange={handleFilterChange}
          >
            <option value="">Todos</option>
            {uniqueValues.institutions.sort().map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
        </div>

        <div className="mt-8 border-b pb-4 mb-4">
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Limpiar Filtros
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mb-4">Exportar Datos</h3>
        <div className="space-y-3">
          <Button onClick={handleExportExcel} variant="secondary" className="w-full">
            <FileExportIcon className="h-5 w-5 mr-2" />
            Exportar a Excel
          </Button>
          <Button onClick={handleExportPdf} variant="secondary" className="w-full">
            <FilePdfIcon className="h-5 w-5 mr-2" />
            Exportar a PDF
          </Button>
        </div>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border-2 border-blue-500 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <ChevronLeftIcon className={`h-5 w-5 text-blue-500 transition-transform duration-300 ${!isOpen && 'rotate-180'}`} />
      </button>
    </aside>
  );
};

export default FilterSidebar;
