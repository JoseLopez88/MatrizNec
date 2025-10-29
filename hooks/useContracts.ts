import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contract, ContractFilter, NewContract } from '../types.ts';
import { contractService } from '../services/contractService.ts';

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContractFilter>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContracts();
      // Ordenar por ID descendente para ver los más nuevos primero
      const sortedData = data.sort((a, b) => (String(b.id) > String(a.id) ? 1 : -1));
      setAllContracts(sortedData);
    } catch (e) {
  const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido';
  setError(`Error al cargar los contratos: ${errorMessage}`);
  console.error(e);
}
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);
  
  useEffect(() => {
    const safeToLowerCase = (value: unknown) => String(value || '').toLowerCase();

    const filtered = allContracts
      .filter(contract => {
        // Case-insensitive and type-safe filtering for robustness
        const matchType = !filters.contractType || safeToLowerCase(contract.contractType) === safeToLowerCase(filters.contractType);
        const matchPackage = !filters.packageName || safeToLowerCase(contract.packageName) === safeToLowerCase(filters.packageName);
        const matchContractor = !filters.contractor || safeToLowerCase(contract.contractor) === safeToLowerCase(filters.contractor);
        const matchInstitution = !filters.educationalInstitution || safeToLowerCase(contract.educationalInstitution) === safeToLowerCase(filters.educationalInstitution);
        return matchType && matchPackage && matchContractor && matchInstitution;
      })
      .filter(contract => {
        if (!searchTerm) return true;
        const lowerSearchTerm = safeToLowerCase(searchTerm);
        return (
          safeToLowerCase(contract.educationalInstitution).includes(lowerSearchTerm) ||
          safeToLowerCase(contract.cui).includes(lowerSearchTerm) ||
          safeToLowerCase(contract.contractor).includes(lowerSearchTerm)
        );
      });
      setContracts(filtered);
  }, [allContracts, filters, searchTerm]);


  const addContract = async (contractData: NewContract) => {
    try {
      const newContract = await contractService.createContract(contractData);
      // Actualización optimista: añade el nuevo contrato al inicio de la lista
      setAllContracts(prev => [newContract, ...prev]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido';
      setError(`Error al crear el contrato: ${errorMessage}`);
      console.error(e);
    }
  };

  const updateContract = async (updatedContract: Contract) => {
    try {
      const updated = await contractService.updateContract(updatedContract);
      // Actualización optimista: reemplaza el contrato existente
      setAllContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido';
      setError(`Error al actualizar el contrato: ${errorMessage}`);
      console.error(e);
    }
  };
  
  const deleteContract = async (cui: string) => {
    try {
        await contractService.deleteContract(cui);
        // Actualización optimista: filtra el contrato eliminado usando CUI
        setAllContracts(prev => prev.filter(c => c.cui !== cui));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`Error al eliminar el contrato: ${e.message}`);
        console.error(e);
      } else {
        setError('Ocurrió un error desconocido');
        console.error(e);
      }
        throw e; // Re-lanzar el error para manejarlo en el componente
    }
  };

  const uniqueValues = useMemo(() => {
    const safeTrim = (value: unknown) => String(value || '').trim();
    // Trim and filter out empty values for cleaner dropdowns, ensuring values are strings
    const packageNames = [...new Set(allContracts.map(c => safeTrim(c.packageName)).filter(Boolean))];
    const contractors = [...new Set(allContracts.map(c => safeTrim(c.contractor)).filter(Boolean))];
    const institutions = [...new Set(allContracts.map(c => safeTrim(c.educationalInstitution)).filter(Boolean))];
    return { packageNames, contractors, institutions };
  }, [allContracts]);


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
