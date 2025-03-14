// src/components/app/Match/Board/DraggablePiece.tsx
import { useGameplayStore } from '@/stores'
import { Piece } from '@/types'
import React, { useRef, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { JSX } from 'react/jsx-runtime'

interface DraggablePieceProps {
  piece: Piece
  renderPiece: (piece: Piece) => JSX.Element
  onSelect: (piece: Piece) => void
  isActive?: boolean // Nueva prop para determinar si la pieza está activa (es tu turno)
  gameStatus: string
}

const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  renderPiece,
  onSelect,
  isActive = true, // Por defecto activa para compatibilidad con el código existente
  gameStatus,
}) => {
  const menuSelectedPieceId = useGameplayStore(
    (state) => state.menuSelectedPieceId
  )
  const isSelectedInMenu = piece.id === menuSelectedPieceId

  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { id: piece.id, type: piece.type },
    canDrag: () => {
      // Piezas muertas no se pueden arrastrar
      if (piece.is_alive === false || piece.hp <= 0) {
        return false
      }
      return isActive && gameStatus !== 'deployment'
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (divRef.current) {
      drag(divRef.current)
    }
  }, [drag])

  return (
    <div
      ref={divRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: '100%',
        height: '100%',
        cursor: isActive ? 'grab' : 'not-allowed',
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (isActive && piece.is_alive !== false) {
          // Solo seleccionar si está activa
          onSelect(piece)
        }
      }}
      className={`${!isActive ? 'grayscale' : ''} transition-all duration-300`}
    >
      {renderPiece(piece)}

      {/* Añadir un resaltado adicional si está seleccionada en el menú */}
      {isSelectedInMenu && (
        <div className="absolute inset-0 border-4 border-yellow-500 rounded-full animate-pulse opacity-70"></div>
      )}

      {/* Indicador visual de pieza inactiva o muerta */}
      {(!isActive || piece.is_alive === false) && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

export default DraggablePiece
