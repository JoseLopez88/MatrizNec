// --- CONFIGURATION ---
const SPREADSHEET_ID = "12YjBj0_bT8gBsf7VNyHFkgzLa1bNTXcVUKEfhfy_gLQ";
const SHEET_NAME = "Contratos";

// --- COLUMN MAPPING ---
// CRÍTICO: Este mapa traduce las cabeceras de tu Google Sheet (en español)
// a las claves internas de la aplicación (en camelCase).
// Las claves de la izquierda DEBEN COINCIDIR EXACTAMENTE con las cabeceras de tu hoja.
const COLUMN_MAP = {
  // Hoja de Cálculo -> Aplicación
  'Tipo de Contrato': 'contractType',
  'Paquete': 'packageName',
  'Contratista': 'contractor',
  'CUI': 'cui',
  'Nombre de la Institución Educativa (I.E.)': 'educationalInstitution',
  'monto del contrato (original)': 'montoContratoOriginal',
  'monto del contrato actualizado': 'montoContratoActualizado',
  'Periodo vigente': 'periodoVigente',
  'Fecha de Inicio': 'startDate', // Asumido, ya que estaba en la app
  'Fecha de Fin': 'endDate', // Asumido, ya que estaba en la app
  'Enlace del contrato y sus adendas': 'enlaceContratoAdendas',
  '% de avance de ejecución': 'avanceEjecucion',
  'última valorización': 'ultimaValorizacion',
  'Periodo de pago': 'periodoPago',
  'Documento interno (con Conformidad)': 'documentoInternoConformidad',
  'Factura': 'factura',
  'Fecha de presentación de la factura': 'fechaPresentacionFactura',
  'Fecha de vencimiento de pago': 'fechaVencimientoPago',
  'E-SINAD': 'eSinad',
  'Enlace para acceder a los documentos de las valorizaciones': 'enlaceDocumentosValorizaciones',
  'Garantías de fiel Cumplimiento': 'garantiasFielCumplimiento',
  '% del Precio del contrato': 'porcentajePrecioContrato',
  'Acumulado de la retención por fondo de garantía': 'acumuladoRetencionGarantia',
  'Enlace para acceder a las garantías y reportes de las mismas': 'enlaceGarantiasReportes'
};

// --- HELPERS ---

/**
 * Normalizes a header string for reliable matching.
 * @param {string} header The original header text.
 * @returns {string} The normalized header.
 */
function normalizeHeader(header) {
  return typeof header === 'string' ? header.trim().toLowerCase() : '';
}

/**
 * Safely formats a date object or string into 'YYYY-MM-DD'.
 * @param {Date|string} dateInput The date to format.
 * @returns {string} The formatted date string, or an empty string if invalid.
 */
function formatDate(dateInput) {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateInput;
      }
      return '';
    }
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
}

/**
 * Converts a row array from the sheet into a structured contract object.
 * @param {Array} rowData The array of cell values for a single row.
 * @param {Object} headerMap A map of { normalizedHeader -> appKey }.
 * @param {Array} originalHeaders The original, non-normalized headers.
 * @returns {Object} A contract object.
 */
function rowToContractObject(rowData, headerMap, originalHeaders) {
  const contract = {};

  originalHeaders.forEach((header, index) => {
    const appKey = headerMap[normalizeHeader(header)];
    if (appKey) {
      const value = rowData[index];
      // Sanitize data: trim strings to ensure consistent filtering
      contract[appKey] = (typeof value === 'string') ? value.trim() : value;
    }
  });

  // --- Data Type Conversion & Field Derivation ---
  Object.keys(contract).forEach(key => {
      const numFields = [
          'montoContratoOriginal', 'montoContratoActualizado', 'avanceEjecucion',
          'porcentajePrecioContrato', 'acumuladoRetencionGarantia'
      ];
      if (numFields.includes(key)) {
          const val = parseFloat(contract[key]);
          contract[key] = isNaN(val) ? 0 : val;
      }
  });

  ['startDate', 'endDate', 'ultimaValorizacion', 'fechaPresentacionFactura', 'fechaVencimientoPago'].forEach(dateKey => {
    if (contract[dateKey]) {
      contract[dateKey] = formatDate(contract[dateKey]);
    } else {
      contract[dateKey] = ''; // Ensure date fields are at least empty strings
    }
  });

  contract.id = contract.cui;
  const progress = contract.avanceEjecucion || 0;
  contract.status = progress >= 100 ? 'Completado' : 'Activo';
  contract.totalAmount = contract.montoContratoActualizado || 0;
  contract.executionProgress = contract.avanceEjecucion || 0;

  return contract;
}

// --- API ENDPOINTS (doGet, doPost) ---

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
    
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length < 2) {
      return ContentService.createTextOutput(JSON.stringify({ contracts: [] })).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = values.shift();
    Logger.log("Headers from sheet: " + JSON.stringify(headers)); // Diagnostic log

    const headerMap = {};
    for (const key in COLUMN_MAP) {
      headerMap[normalizeHeader(key)] = COLUMN_MAP[key];
    }
    
    const contracts = values.map(row => rowToContractObject(row, headerMap, headers));
    
    return ContentService.createTextOutput(JSON.stringify({ contracts }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ error: `Server error: ${error.message}` }))
      .setMimeType(ContentService.MimeType.JSON)
      .setStatusCode(500);
  }
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;
    
    if (!action || !payload) throw new Error("Action or payload missing.");

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

    let result;
    switch (action.toUpperCase()) {
      case 'CREATE':
        result = createContract(sheet, payload);
        break;
      case 'UPDATE':
        result = updateContract(sheet, payload);
        break;
      case 'DELETE':
        result = deleteContract(sheet, payload);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
    
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log(`Error in doPost: ${error.toString()} | Payload: ${e.postData.contents}`);
    return ContentService
      .createTextOutput(JSON.stringify({ error: `Request error: ${error.message}` }))
      .setMimeType(ContentService.MimeType.JSON)
      .setStatusCode(400);
  }
}

// --- CRUD LOGIC ---

function createContract(sheet, contractData) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const headerToAppKeyMap = {};
    for (const key in COLUMN_MAP) {
      headerToAppKeyMap[normalizeHeader(key)] = COLUMN_MAP[key];
    }

  const newRow = headers.map(header => {
      const appKey = headerToAppKeyMap[normalizeHeader(header)];
      return appKey && contractData[appKey] !== undefined ? contractData[appKey] : "";
  });
  
  sheet.appendRow(newRow);
  
  const newContractObject = rowToContractObject(newRow, headerToAppKeyMap, headers);
  return newContractObject;
}

function findRowIndexByCui(sheet, cui) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const cuiHeader = Object.keys(COLUMN_MAP).find(key => COLUMN_MAP[key] === 'cui');
  const cuiColumnIndex = headers.findIndex(header => normalizeHeader(header) === normalizeHeader(cuiHeader));
  
  if (cuiColumnIndex === -1) throw new Error(`Could not find CUI column header "${cuiHeader}" in the sheet.`);
  
  const cuiValues = sheet.getRange(2, cuiColumnIndex + 1, sheet.getLastRow() - 1, 1).getValues();
  const rowIndex = cuiValues.findIndex(row => String(row[0]).trim() == String(cui).trim());
  
  return rowIndex !== -1 ? rowIndex + 2 : -1;
}

function updateContract(sheet, contractData) {
  const rowIndex = findRowIndexByCui(sheet, contractData.cui);
  if (rowIndex === -1) throw new Error(`Contract with CUI ${contractData.cui} not found.`);

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const headerToAppKeyMap = {};
  for (const key in COLUMN_MAP) {
    headerToAppKeyMap[normalizeHeader(key)] = COLUMN_MAP[key];
  }

  const updatedRow = headers.map(header => {
      const appKey = headerToAppKeyMap[normalizeHeader(header)];
      return appKey && contractData[appKey] !== undefined ? contractData[appKey] : "";
  });
  
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRow]);

  const updatedContractObject = rowToContractObject(updatedRow, headerToAppKeyMap, headers);
  return updatedContractObject;
}

function deleteContract(sheet, payload) {
  const cui = payload.id;
  if (!cui) throw new Error("CUI (id) is missing in the delete payload.");

  const rowIndex = findRowIndexByCui(sheet, cui);
  if (rowIndex === -1) throw new Error(`Contract with CUI ${cui} not found for deletion.`);
  
  sheet.deleteRow(rowIndex);
  
  return { success: true, id: cui };
}