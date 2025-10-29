import React from 'react';
import { Contract, ContractFilter, ContractType } from '../types.ts';
import Select from './ui/Select.tsx';
import Button from './ui/Button.tsx';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon.tsx';
import { FileExportIcon } from './icons/FileExportIcon.tsx';
import { FilePdfIcon } from './icons/FilePdfIcon.tsx';
import { LogoIcon } from './icons/LogoIcon.tsx';

// Declaring global variables loaded from CDN scripts in index.html
declare var jsPDF: any;
declare var XLSX: any;

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
    const dataToExport = contracts.map(c => ({
      'CUI': c.cui,
      'Institución Educativa': c.educationalInstitution,
      'Contratista': c.contractor,
      'Paquete': c.packageName,
      'Tipo de Contrato': c.contractType,
      'Estado': c.status,
      'Avance de Ejecución (%)': c.executionProgress,
      'Monto Total (USD)': c.totalAmount,
      'Fecha de Inicio': c.startDate,
      'Fecha de Fin': c.endDate,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');
    XLSX.writeFile(workbook, 'exportacion_contratos.xlsx');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF.default({ orientation: 'landscape' });
    
    (doc as any).autoTable({
      head: [['CUI', 'Institución', 'Contratista', 'Avance (%)', 'Estado', 'Monto Total (USD)']],
      body: contracts.map(c => [
        c.cui,
        c.educationalInstitution,
        c.contractor,
        c.executionProgress,
        c.status,
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c.totalAmount)
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 50 },
      }
    });

    doc.save('exportacion_contratos.pdf');
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