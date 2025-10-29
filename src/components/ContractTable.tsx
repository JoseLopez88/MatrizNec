import React, { useState, useMemo } from 'react';
import { Contract, ContractStatus } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import Card from './ui/Card';
import Button from './ui/Button';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface ContractTableProps {
  contracts: Contract[];
  loading: boolean;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
  onView: (contract: Contract) => void;
}

const ITEMS_PER_PAGE = 10;

const ContractTable: React.FC<ContractTableProps> = ({ contracts, loading, onEdit, onDelete, onView }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return contracts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [contracts, currentPage]);

  const totalPages = Math.ceil(contracts.length / ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadge = (status: ContractStatus) => {
    const styles = {
      [ContractStatus.Active]: 'bg-green-100 text-green-800',
      [ContractStatus.Completed]: 'bg-blue-100 text-blue-800',
      [ContractStatus.OnHold]: 'bg-yellow-100 text-yellow-800',
      [ContractStatus.Cancelled]: 'bg-red-100 text-red-800',
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`;
  };

  if (loading) {
    return (
      <Card className="text-center py-10">
        <p>Cargando contratos...</p>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card className="text-center py-10">
        <p>No se encontraron contratos con los filtros aplicados.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUI</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institución Educativa</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contratista</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avance</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedContracts.map((contract) => (
            <tr key={contract.id} onClick={() => onView(contract)} className="hover:bg-gray-100 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.cui}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.educationalInstitution}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.contractor}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <span>{contract.executionProgress}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2.5 ml-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${contract.executionProgress}%` }}></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadge(contract.status)}>{contract.status}</span>
              </td>
              <td 
                className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => onEdit(contract)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(contract.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="py-3 px-6 border-t flex items-center justify-between">
            <span className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
            </span>
            <div className="flex items-center space-x-2">
                <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
                    <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
                    <ChevronRightIcon className="h-5 w-5" />
                </Button>
            </div>
        </div>
      )}
    </Card>
  );
};

export default ContractTable;
