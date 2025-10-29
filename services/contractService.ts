import { Contract, NewContract } from '../types';

// --- INSTRUCCIONES ---
// 1. Despliega el script de Google Apps (`Code.gs`) como una aplicación web.
// 2. Otorga los permisos necesarios ("Acceso: Cualquier persona").
// 3. Copia la URL de la aplicación web desplegada.
// 4. Pega la URL aquí abajo, reemplazando el texto de marcador de posición.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdCAdE4VYHE8XRrRegjviBWxKKTs4B5LAhVyF-3kCzp-UVmP_Ypj1rxZ_f7H05TVsy/exec';

const URL_NOT_CONFIGURED_ERROR = "La URL de Apps Script no ha sido configurada en services/contractService.ts. Reemplace el valor de SCRIPT_URL.";

// Helper para manejar errores de la API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error de red o respuesta no JSON' }));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const postRequest = async (body: object) => {
  if (SCRIPT_URL.includes('PEGA_AQUÍ')) {
      const error = new Error(URL_NOT_CONFIGURED_ERROR);
      console.error(error);
      throw error;
  }
  
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    // Cambiamos a 'text/plain' para evitar la solicitud de preflight (OPTIONS) de CORS,
    // que es la causa común del error "Failed to fetch" con Google Apps Script.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
    redirect: 'follow', 
  });
  
  return handleResponse(response);
};

class ContractService {
  /**
   * Realiza una llamada a la API de Apps Script.
   * GET /
   */
  async getContracts(): Promise<Contract[]> {
    if (SCRIPT_URL.includes('PEGA_AQUÍ')) {
      console.error(URL_NOT_CONFIGURED_ERROR);
      return [];
    }
    const response = await fetch(SCRIPT_URL);
    const data = await handleResponse(response);
    return data.contracts || [];
  }

  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'CREATE'
   */
  async createContract(contractData: NewContract): Promise<Contract> {
    return postRequest({
      action: 'CREATE',
      payload: contractData,
    });
  }

  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'UPDATE'
   */
  async updateContract(updatedContract: Contract): Promise<Contract> {
    return postRequest({
      action: 'UPDATE',
      payload: updatedContract,
    });
  }
  
  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'DELETE'
   */
  async deleteContract(id: string): Promise<void> {
    await postRequest({
      action: 'DELETE',
      payload: { id },
    });
  }
}

export const contractService = new ContractService();
