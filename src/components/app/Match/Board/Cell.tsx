import { Piece } from '@/types'
import React, { useRef, useEffect } from 'react'
import { useDrop } from 'react-dnd'

interface CellProps {
  x: number
  y: number
  children?: React.ReactNode
  onPieceDrop: (pieceId: string, pos_x: number, pos_y: number) => void
  onEmptyCellClick: () => void
  getPieceById: (id: string) => Piece | undefined
}

const BoardCell: React.FC<CellProps> = ({
  x,
  y,
  children,
  onPieceDrop,
  onEmptyCellClick,
  getPieceById,
}) => {
  const cellRef = useRef<HTMLDivElement>(null)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'piece',
    // El callback "canDrop" valida si el movimiento está dentro del rango
    canDrop: (item: { id: string; type: string }) => {
      // Buscar la pieza desde el id, por ejemplo, usando una función pasada como prop
      const piece = getPieceById(item.id)
      if (!piece) return false

      // Calcular la distancia Manhattan entre la posición actual y la celda destino
      const distance = Math.abs(piece.pos_x - x) + Math.abs(piece.pos_y - y)
      return piece.movement !== undefined && distance <= piece.movement
    },
    drop: (item: { id: string; type: string }) => {
      // Solo se ejecuta si canDrop es true
      onPieceDrop(item.id, x, y)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  useEffect(() => {
    if (cellRef.current) {
      drop(cellRef.current)
    }
  }, [drop])

  // Si está sobre la celda y no es válido, mostramos rojo; si es válido, verde
  const cellBgColor =
    isOver && children
      ? '' // Si hay una pieza ya en la celda, no aplicamos color
      : isOver
        ? canDrop
          ? 'bg-green-500/50'
          : 'bg-red-500/50'
        : ''

  return (
    <div
      ref={cellRef}
      onClick={() => {
        if (!children) {
          onEmptyCellClick()
        }
      }}
      className={`w-6 h-6 border border-gray-800 relative ${
        (x + y) % 2 === 0 ? 'bg-gray-900/80' : 'bg-black/70'
      } ${cellBgColor}`}
      data-x={x}
      data-y={y}
    >
      {children}
    </div>
  )
}

export default BoardCell
