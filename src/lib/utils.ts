import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind y resuelve conflictos
 * @param inputs Clases CSS a combinar
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a un formato local
 * @param dateString Cadena de fecha ISO a formatear
 * @returns Fecha formateada en formato local (dd/mm HH:MM)
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}