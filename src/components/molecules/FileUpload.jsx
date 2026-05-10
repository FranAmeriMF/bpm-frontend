import { useState, useRef } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn, formatFileSize } from '@utils/helpers';

const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

/**
 * Componente de carga de archivos con drag & drop.
 * - onFileSelect(file): llamado cuando el usuario selecciona un archivo válido
 * - currentFile: File | null — muestra el archivo seleccionado
 * - onRemove(): llamado cuando el usuario quita el archivo
 * La llamada real a la API se hace en el nivel de página (Phase 6).
 */
const FileUpload = ({ onFileSelect, currentFile, onRemove, disabled, error, label }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && ALLOWED_TYPES[file.type]) {
      onFileSelect?.(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect?.(file);
    e.target.value = '';
  };

  if (currentFile) {
    return (
      <div className="space-y-1.5">
        {label && <span className="block text-label-md text-on-surface-variant">{label}</span>}
        <div className="flex items-center gap-3 p-3 rounded bg-surface-container border-2 border-primary/20">
          <DocumentIcon className="h-8 w-8 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface truncate">{currentFile.name}</p>
            <p className="text-body-sm text-on-surface-variant">{formatFileSize(currentFile.size)}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded hover:bg-surface-container-high transition-colors flex-shrink-0"
              aria-label="Quitar archivo"
            >
              <XMarkIcon className="h-5 w-5 text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {label && <span className="block text-label-md text-on-surface-variant">{label}</span>}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary-fixed/30'
            : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
          error && 'border-error/40 bg-error-container/10'
        )}
      >
        <CloudArrowUpIcon className="h-10 w-10 text-on-surface-variant mx-auto mb-3" />
        <p className="text-body-md text-on-surface">
          Arrastrá un archivo o{' '}
          <span className="text-primary font-medium">hacé clic para seleccionar</span>
        </p>
        <p className="text-body-sm text-on-surface-variant mt-1">PDF, JPG, PNG o DOCX — máx. 10 MB</p>
      </div>
      {error && <p className="text-label-sm text-error px-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.docx"
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

export default FileUpload;
