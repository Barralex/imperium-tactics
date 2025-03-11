// Lobby/components/StyledElements.tsx
import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Contenedor principal del lobby
 */
export const LobbyContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div 
    className={cn("container mx-auto px-4 py-8", className)} 
    data-testid="lobby-container" 
    {...props}
  >
    {children}
  </div>
)

/**
 * Encabezado del lobby con título y controles
 */
export const LobbyHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div 
    className={cn("flex flex-col md:flex-row justify-between items-center mb-8", className)} 
    data-testid="lobby-header" 
    {...props}
  >
    {children}
  </div>
)

/**
 * Grid responsivo para mostrar las cards de partidas
 */
export const CardGrid: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div 
    className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)} 
    data-testid="card-grid" 
    {...props}
  >
    {children}
  </div>
)

/**
 * Contenedor con efecto de borde para secciones destacadas
 */
export const BorderedContainer: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { isHighlighted?: boolean }
> = ({ children, className, isHighlighted = false, ...props }) => (
  <div
    className={cn(
      "border rounded-md p-4 transition-all duration-200",
      isHighlighted 
        ? "border-amber-500/50 bg-black/40" 
        : "border-gray-700/50 bg-black/20",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

/**
 * Badge para estados o etiquetas
 */
export const StatusBadge: React.FC<{
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
    className?: string
    children: React.ReactNode
    [key: string]: unknown 
  }> = ({ children, className, variant = 'default', ...props }) => {
    const variantClasses = {
      success: 'bg-green-500/20 text-green-500 border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      danger: 'bg-red-500/20 text-red-500 border-red-500/30',
      info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      default: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
  
    return (
      <span
        className={cn(
          "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap font-medium",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  };