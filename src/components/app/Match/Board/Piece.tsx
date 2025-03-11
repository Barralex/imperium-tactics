import { Piece } from '@/types'
import React, { useRef, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { JSX } from 'react/jsx-runtime'

interface DraggablePieceProps {
  piece: Piece
  renderPiece: (piece: Piece) => JSX.Element
  onSelect: (piece: Piece) => void
}

const DraggablePiece: React.FC<DraggablePieceProps> = ({
  piece,
  renderPiece,
  onSelect,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { id: piece.id, type: piece.type },
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
      style={{ opacity: isDragging ? 0.5 : 1, width: '100%', height: '100%' }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(piece)
      }}
    >
      {renderPiece(piece)}
    </div>
  )
}

export default DraggablePiece
