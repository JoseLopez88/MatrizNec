import React, { useState } from 'react';
import { Contract, NewContract } from './types';
import { useContracts } from './hooks/useContracts';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FilterSidebar from './components/FilterSidebar';
import ContractTable from './components/ContractTable';
import ContractModal from './components/ContractModal';
import ContractDetailModal from './components/ContractDetailModal';

export default function App() {
  const {
    contracts,
    loading,
    error,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    addContract,
    updateContract,
    deleteContract,
    uniqueValues,
  } = useContracts();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  const handleOpenEditModal = (contract: Contract | null = null) => {
    setEditingContract(contract);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingContract(null);
    setIsEditModalOpen(false);
  };

  const handleOpenDetailModal = (contract: Contract) => {
    setViewingContract(contract);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseDetailModal = () => {
    setViewingContract(null);
    setIsDetailModalOpen(false);
  };


  const handleSaveContract = async (contractData: Contract | NewContract) => {
    if ('id' in contractData) {
      await updateContract(contractData as Contract);
    } else {
      await addContract(contractData as NewContract);
    }
    handleCloseEditModal();
  };
  
  const handleDeleteContract = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este contrato?')) {
        await deleteContract(id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        uniqueValues={uniqueValues}
        contracts={contracts}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddContract={() => handleOpenEditModal()}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Dashboard contracts={contracts} />
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          <ContractTable
            contracts={contracts}
            loading={loading}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteContract}
            onView={handleOpenDetailModal}
          />
        </main>
      </div>

      {isEditModalOpen && (
        <ContractModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveContract}
          contract={editingContract}
        />
      )}

      {isDetailModalOpen && viewingContract && (
        <ContractDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          contract={viewingContract}
        />
      )}
    </div>
  );
}
