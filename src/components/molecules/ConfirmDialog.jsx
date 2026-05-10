import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '@components/atoms/Button';

/**
 * Modal de confirmación con glassmorphism.
 * variant: 'default' | 'danger'
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isLoading = false,
}) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-shadow/40 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-surface-container-low/90 backdrop-blur-glass rounded-lg shadow-ambient-lg p-6 space-y-4">
              {variant === 'danger' && (
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-container mx-auto">
                  <ExclamationTriangleIcon className="h-6 w-6 text-error" />
                </div>
              )}

              <Dialog.Title className="text-title-lg text-on-surface text-center font-medium">
                {title}
              </Dialog.Title>

              {message && (
                <Dialog.Description className="text-body-md text-on-surface-variant text-center">
                  {message}
                </Dialog.Description>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  variant={variant === 'danger' ? 'error' : 'primary'}
                  className="flex-1"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;
