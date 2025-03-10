import React from 'react'
import { ButtonProps, LoadingButtonProps } from '../../../types'

export const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
  title,
  children,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`imperial-button rounded ${className}`}
    title={title}
  >
    {children}
  </button>
)

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
    className={`flex items-center gap-2 ${className}`}
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

export const ErrorDisplay: React.FC<{
  message: string
  onRetry: () => void
}> = ({ message, onRetry }) => (
  <div className="container mx-auto px-4 py-8">
    <div className="border border-destructive p-6 bg-destructive/10 rounded-lg text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto text-destructive mb-4 h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 9h2v6H8z" />
        <path d="M14 9h2v6h-2z" />
      </svg>
      <h2 className="text-2xl font-bold text-destructive mb-2">
        ERROR DE COMUNICACIÓN
      </h2>
      <p className="text-destructive/90 mb-4">
        Los servidores del Adeptus Mechanicus no responden: {message}
      </p>
      <button
        onClick={onRetry}
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded imperial-button"
      >
        Reintentar conexión
      </button>
    </div>
  </div>
)

export const LoadingSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex justify-between items-center mb-8">
      <div className="h-8 bg-muted/30 w-64 rounded animate-pulse"></div>
      <div className="h-10 bg-muted/30 w-48 rounded animate-pulse"></div>
    </div>

    {[...Array(3)].map((_, index) => (
      <div key={index} className="war-zone-card mb-4 p-6 animate-pulse">
        <div>
          <div className="h-7 bg-muted rounded w-2/5 mb-3"></div>
          <div className="h-5 bg-muted/60 rounded w-1/3 mb-4"></div>
        </div>
        <div className="flex justify-end mt-4">
          <div className="h-10 bg-muted/40 rounded w-32"></div>
        </div>
      </div>
    ))}
  </div>
)

export const EmptyState: React.FC<{
  onCreateMatch: () => void
  isAuthenticated: boolean
  isCreating: boolean
}> = ({ onCreateMatch, isAuthenticated, isCreating }) => (
  <div className="empty-state p-10 border-2 border-dashed border-muted rounded-lg text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto text-muted-foreground mb-4 h-16 w-16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
    <p className="empty-state-text text-xl mb-6">
      No hay zonas de guerra activas. La galaxia aguarda a que comandes tus
      fuerzas.
    </p>
    {isAuthenticated && (
      <button
        onClick={onCreateMatch}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded imperial-button"
        disabled={isCreating}
      >
        {isCreating ? 'Desplegando fuerzas...' : 'Iniciar Nueva Campaña'}
      </button>
    )}
  </div>
)
