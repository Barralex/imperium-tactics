// src/components/app/Match/Board/AttackLine.tsx
import React from 'react'
import { Piece } from '@/types'

interface AttackLineProps {
  attacker: Piece
  target: Piece
  canAttack: boolean
}

const AttackLine: React.FC<AttackLineProps> = ({
  attacker,
  target,
  canAttack,
}) => {
  // Calcular las coordenadas centrales de las celdas (cada celda es de 24px = 6x4)
  // El +3 es la mitad del tamaño de la celda para apuntar al centro
  const startX = attacker.pos_x * 24 + 12
  const startY = attacker.pos_y * 24 + 12
  const endX = target.pos_x * 24 + 12
  const endY = target.pos_y * 24 + 12

  // Calcular la distancia Manhattan para mostrarla
  const distance =
    Math.abs(attacker.pos_x - target.pos_x) +
    Math.abs(attacker.pos_y - target.pos_y)

  // Punto medio para mostrar el texto de la distancia
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-30"
      style={{ padding: '8px' }}
    >
      {/* Línea de ataque */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={canAttack ? '#ff5555' : '#777777'}
        strokeWidth="2"
        strokeDasharray={canAttack ? 'none' : '5,5'}
        strokeOpacity="0.8"
      />

      {/* Círculos en los extremos */}
      <circle
        cx={startX}
        cy={startY}
        r="6"
        fill="#ffaa00"
        stroke="#ff5500"
        strokeWidth="1.5"
      />
      <circle
        cx={endX}
        cy={endY}
        r="6"
        fill={canAttack ? '#ff5555' : '#777777'}
      />

      {/* Texto con la distancia */}
      <rect
        x={midX - 12}
        y={midY - 10}
        width="24"
        height="20"
        rx="4"
        fill={canAttack ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
      />
      <text
        x={midX}
        y={midY + 5}
        textAnchor="middle"
        fill="white"
        fontSize="12px"
        fontWeight="bold"
      >
        {distance}
      </text>

      {/* Indicador visual del rango de la unidad atacante */}
      <circle
        cx={startX}
        cy={startY}
        r={attacker.range * 24}
        fill="none"
        stroke="#ffaa00"
        strokeWidth="1"
        strokeDasharray="5,5"
        strokeOpacity="0.5"
      />
    </svg>
  )
}

export default AttackLine
