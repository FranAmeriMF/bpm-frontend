import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern, { locale: es });
  } catch {
    return '—';
  }
};

export const formatDateTime = (date) => formatDate(date, 'dd/MM/yyyy HH:mm');

export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

export const TRAMITE_ESTADO_LABELS = {
  borrador: 'Borrador',
  en_revision_interna: 'Revisión Interna',
  pendiente_asignacion: 'Pendiente Asignación',
  asignado: 'Asignado',
  en_revision: 'En Revisión',
  en_revision_final: 'Decisión Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  observado: 'Observado',
  corrigiendo: 'Corrigiendo',
};

export const ROL_LABELS = {
  admin: 'Administrador',
  director: 'Director',
  solicitante: 'Solicitante',
  moderador: 'Moderador',
  jefe_oficina: 'Jefe de Oficina',
  interno: 'Técnico Interno',
};
