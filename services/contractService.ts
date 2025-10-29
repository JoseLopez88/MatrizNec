import { Contract, NewContract } from '../types';

interface PostRequestBody {
  action: 'GET_CONTRACTS' | 'CREATE' | 'UPDATE' | 'DELETE' | string;
  payload?: Record<string, unknown>;
  [key: string]: unknown; // Uso de unknown en lugar de any para mayor seguridad de tipos
}

// --- INSTRUCCIONES ---
// 1. Despliega el script de Google Apps (`Code.gs`) como una aplicación web.
// 2. Otorga los permisos necesarios ("Acceso: Cualquier persona").
// 3. Copia la URL de la aplicación web desplegada.
// 4. Pega la URL aquí abajo, reemplazando el texto de marcador de posición.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3I83ADi4pRGWeG-Q2EZ4_gz-e0ev0mgyvJPEbN8ndTsMtI9nrPgYUw7cZgxPE5nhB/exec';

const URL_NOT_CONFIGURED_ERROR = "La URL de Apps Script no ha sido configurada en services/contractService.ts. Reemplace el valor de SCRIPT_URL.";

// Helper para manejar errores de la API
const handleResponse = async (response: Response) => {
  try {
    console.log('Estado de la respuesta:', response.status, response.statusText);
    const data = await response.text();
    console.log('Respuesta en texto plano:', data);
    
    let json;
    try {
      json = data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      throw new Error(`Respuesta no válida del servidor: ${data.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      console.error('Error en la respuesta:', json);
      throw new Error(json.error || json.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    if (json.status === 'error') {
      throw new Error(json.message || 'Error en el servidor');
    }
    
    return json;
  } catch (error) {
    console.error('Error al procesar la respuesta:', error);
    throw new Error('Error al procesar la respuesta del servidor');
  }
};

const postRequest = async (body: PostRequestBody) => {
  if (!SCRIPT_URL || SCRIPT_URL.includes('PEGA_AQUÍ') || !SCRIPT_URL.startsWith('http')) {
    const error = new Error(URL_NOT_CONFIGURED_ERROR);
    console.error(error);
    throw error;
  }
  
  try {
    console.log('Enviando solicitud a:', SCRIPT_URL);
    console.log('Datos enviados:', JSON.stringify(body, null, 2));
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...body,
        // Asegurarse de que el action esté presente
        action: body['action'] || 'UNKNOWN_ACTION'
      }),
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      redirect: 'follow',
    });
    
    console.log('Respuesta recibida - Estado:', response.status, response.statusText);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en la solicitud POST:', error);
    if (error instanceof Error) {
      throw new Error(`Error de red: ${error.message}`);
    }
    throw new Error('Error desconocido al conectar con el servidor');
  }
};

class ContractService {
  /**
   * Realiza una llamada a la API de Apps Script.
   * GET /
   */
  async getContracts(): Promise<Contract[]> {
    try {
      console.log('Obteniendo contratos...');
      const response = await postRequest({
        action: 'GET_CONTRACTS',
        payload: {}
      });
      
      console.log('Contratos recibidos:', response);
      
      // Asegurarse de que la respuesta es un array
      if (!Array.isArray(response)) {
        console.warn('La respuesta no es un array:', response);
        return [];
      }
      
      return response;
    } catch (error) {
      console.error('Error en getContracts:', error);
      throw error;
    }
  }

  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'CREATE'
   */
  async createContract(contract: NewContract): Promise<Contract> {
    const response = await postRequest({
      action: 'CREATE',
      payload: contract as Record<string, unknown>
    });
    return response as Contract;
  }

  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'UPDATE'
   */
  // En services/contractService.ts
async updateContract(contract: Contract): Promise<Contract> {
  const response = await postRequest({
    action: 'UPDATE',
    payload: contract as unknown as Record<string, unknown>
  });
  return response as Contract;
}
  
  /**
   * Realiza una llamada a la API de Apps Script.
   * POST / con action: 'DELETE'
   */
  async deleteContract(cui: string): Promise<boolean> {
    const response = await postRequest({
      action: 'DELETE',
      payload: { id: cui } as Record<string, unknown>
    });
    return (response as { success: boolean }).success;
  }
}

export const contractService = new ContractService();
