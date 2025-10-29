import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contract, ContractFilter, NewContract } from '../types';
import { contractService } from '../services/contractService';

export const useContracts = () => {
  // Estados
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContractFilter>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Cargar contratos
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContracts();
      const sortedData = data.sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1));
      setAllContracts(sortedData);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido';
      setError(`Error al cargar los contratos: ${errorMessage}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    const filtered = allContracts.filter(contract => {
      // Aplicar filtros
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(contract[key as keyof Contract]).toLowerCase() === 
               String(value).toLowerCase();
      });

      // Aplicar búsqueda
      const matchesSearch = !searchTerm || 
        Object.values(contract).some(
          val => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );

      return matchesFilters && matchesSearch;
    });

    setContracts(filtered);
  }, [allContracts, filters, searchTerm]);

  // Obtener valores únicos para los filtros
  const uniqueValues = useMemo(() => {
    const safeTrim = (value: unknown) => (value ? String(value).trim() : '');
    
    return {
      contractTypes: [...new Set(allContracts.map(c => safeTrim(c.contractType)).filter(Boolean))],
      packageNames: [...new Set(allContracts.map(c => safeTrim(c.packageName)).filter(Boolean))],
      contractors: [...new Set(allContracts.map(c => safeTrim(c.contractor)).filter(Boolean))],
      institutions: [...new Set(allContracts.map(c => safeTrim(c.educationalInstitution)).filter(Boolean))]
    };
  }, [allContracts]);

  // Agregar un nuevo contrato
  const addContract = useCallback(async (newContract: NewContract) => {
    try {
      const addedContract = await contractService.createContract(newContract);
      setAllContracts(prev => [addedContract, ...prev]);
      return addedContract;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al agregar el contrato';
      setError(errorMessage);
      throw e;
    }
  }, []);

  // Actualizar un contrato existente
  const updateContract = useCallback(async (updatedContract: Contract) => {
    try {
      const result = await contractService.updateContract(updatedContract);
      setAllContracts(prev => 
        prev
          .map(contract => contract.id === updatedContract.id ? result : contract)
          .sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1))
      );
      return result;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al actualizar el contrato';
      setError(errorMessage);
      throw e;
    }
  }, []);

  // Eliminar un contrato
  const deleteContract = useCallback(async (cui: string) => {
    try {
      await contractService.deleteContract(cui);
      setAllContracts(prev => 
        prev
          .filter(contract => contract.cui !== cui)
          .sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1))
      );
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error al eliminar el contrato';
      setError(errorMessage);
      throw e;
    }
  }, []);

  // Cargar los contratos al montar el componente
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // Retornar el estado y las funciones necesarias
  return {
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
    refreshContracts: fetchContracts,
  };
};