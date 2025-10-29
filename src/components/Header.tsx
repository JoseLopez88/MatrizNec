import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import Button from './ui/Button';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddContract: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm, onAddContract }) => {
  return (
    <header className="bg-white shadow-sm p-4 z-10">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por IE, CUI, contratista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="ml-4">
          <Button onClick={onAddContract} variant="primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Añadir Contrato
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
