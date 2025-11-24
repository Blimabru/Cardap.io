/**
 * Service de QR Code
 * 
 * Gerencia geração e validação de QR codes para mesas
 */

import { buscarMesaPorQR } from './mesas.service';
import { Mesa } from '../types';

/**
 * Valida QR code e retorna a mesa associada
 */
export const validarQRCode = async (qrCode: string): Promise<Mesa> => {
  try {
    const mesa = await buscarMesaPorQR(qrCode);
    return mesa;
  } catch (error: any) {
    throw new Error(error.message || 'QR code inválido');
  }
};

/**
 * Gera URL para acesso via QR code
 */
export const gerarURLQRCode = (qrCode: string): string => {
  // Em produção, usar a URL real do app
  // Por enquanto, usar formato relativo
  return `/mesa/${qrCode}`;
};

/**
 * Gera URL completa para QR code (com domínio)
 */
export const gerarURLCompletaQRCode = (qrCode: string, baseURL?: string): string => {
  const urlRelativa = gerarURLQRCode(qrCode);
  
  if (baseURL) {
    return `${baseURL}${urlRelativa}`;
  }
  
  // Fallback: usar localhost em desenvolvimento
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${urlRelativa}`;
  }
  
  return urlRelativa;
};

