import React from 'react';
import { Contract, ContractStatus } from '../types.ts';
import Card from './ui/Card.tsx';
import { useCountUp } from '../hooks/useCountUp.ts';

interface DashboardProps {
  contracts: Contract[];
}

const StatCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
  <Card>
    <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
  </Card>
);


const Dashboard: React.FC<DashboardProps> = ({ contracts }) => {
  const totalContractsValue = contracts.length;
  const activeContractsValue = contracts.filter(c => c.status === ContractStatus.Active).length;
  const totalAmountValue = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const averageProgressValue = totalContractsValue > 0
    ? contracts.reduce((sum, c) => sum + c.executionProgress, 0) / totalContractsValue
    : 0;

  // Use the count-up hook for a dynamic feel
  const totalContracts = useCountUp(totalContractsValue, 1000, 0);
  const activeContracts = useCountUp(activeContractsValue, 1000, 0);
  const totalAmount = useCountUp(totalAmountValue, 1500, 0);
  const averageProgress = useCountUp(averageProgressValue, 1200, 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      <StatCard
        title="Contratos Totales"
        value={totalContracts}
      />
      <StatCard
        title="Contratos Activos"
        value={activeContracts}
        description={`${totalContractsValue > 0 ? Math.round((activeContractsValue / totalContractsValue) * 100) : 0}% del total`}
      />
      <StatCard
        title="Monto Total"
        value={formatCurrency(totalAmount)}
      />
      <StatCard
        title="Avance Promedio"
        value={`${averageProgress}%`}
      />
    </div>
  );
};

export default Dashboard;
