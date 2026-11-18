import axios from 'axios';
import { Platform } from 'react-native';

// En emulador Android, 10.0.2.2 mapea a localhost de la PC.
// En emulador iOS o Web, localhost funciona directamente.
// En dispositivo físico, colocar la IP local de tu PC (ej: http://192.168.1.50:8000/api/v1)
export const DEFAULT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api/v1'
    : 'http://localhost:8000/api/v1';

const mobileApiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default mobileApiClient;
