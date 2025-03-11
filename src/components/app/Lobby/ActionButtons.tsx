import React from 'react'
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
    data-testid="create-button"
  >
    Iniciar Nueva Campaña
  </LoadingButton>
)