import React, { useRef, useEffect } from 'react'
import { useDrop } from 'react-dnd'

interface BoardCellProps {
  x: number
  y: number
  children?: React.ReactNode
  onPieceDrop: (pieceId: string, pos_x: number, pos_y: number) => void
  onEmptyCellClick: () => void
}

const BoardCell: React.FC<BoardCellProps> = ({
  x,
  y,
  children,
  onPieceDrop,
  onEmptyCellClick,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'piece',
    drop: (item: { id: string; type: string }) => {
      onPieceDrop(item.id, x, y)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const cellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cellRef.current) {
      drop(cellRef.current)
    }
  }, [drop])

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
      } ${isOver && canDrop ? 'bg-green-500/50' : ''}`}
      data-x={x}
      data-y={y}
    >
      {children}
    </div>
  )
}

export default BoardCell
