// Lobby/components/ActionButtons.tsx
import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './UIComponents'

export interface ButtonProps {
    onClick: () => void
    disabled?: boolean
    className?: string
    title?: string
    children: React.ReactNode
    isLoading?: boolean      
    loadingText?: string     
    icon?: React.ReactNode   
}

export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean
  loadingText: string
  icon?: React.ReactNode
}

/**
 * Componente de botón base
 */
export const Button: React.FC<ButtonProps> = ({
    onClick,
    disabled = false,
    className = '',
    title,
    children,
    isLoading,
    loadingText,
    icon,
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn("imperial-button rounded", className)}
      title={title}
      data-testid="base-button"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span>{loadingText || children}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </button>
  )

/**
 * Componente de botón con estado de carga
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  disabled = false,
  isLoading,
  loadingText,
  className = '',
  children,
  icon,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={cn("flex items-center gap-2", className)}
    data-testid="loading-button"
  >
    {isLoading ? (
      <>
        <LoadingSpinner />
        {loadingText}
      </>
    ) : (
      <>
        {icon}
        {children}
      </>
    )}
  </Button>
)

/**
 * Botón específico para recargar/refrescar
 */
export const RefreshButton: React.FC<{ onClick: () => void; isLoading: boolean }> = ({
  onClick,
  isLoading,
}) => (
  <LoadingButton
    onClick={onClick}
    isLoading={isLoading}
    loadingText=""
    className="bg-gray-800 hover:bg-gray-700 text-amber-400 px-4 py-3 border border-amber-900/30"
    icon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
          clipRule="evenodd"
        />
      </svg>
    }
    data-testid="refresh-button"
  >
    Actualizar
  </LoadingButton>
)

/**
 * Botón específico para crear una nueva partida
 */
export const CreateButton: React.FC<{ onClick: () => void; isLoading: boolean }> = ({
  onClick,
  isLoading,
}) => (
  <LoadingButton
    onClick={onClick}
    isLoading={isLoading}
    loadingText="Creando..."
    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
    icon={<Plus size={18} />}
    data-testid="create-button"
  >
    Iniciar Nueva Campaña
  </LoadingButton>
)