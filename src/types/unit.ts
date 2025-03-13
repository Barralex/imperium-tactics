// src/config/units.ts
import { Piece, UnitType } from '@/types'
import React from 'react'

/**
 * Base unit stats for all unit types
 */
export interface UnitStats {
  hp: number
  range: number
  movement: number
  damage: number
  description: string
  stats: string
  bgColor: string
  hoverColor: string
  borderColor: string
}

/**
 * Collection of all unit configurations
 */
export const UNIT_CONFIGS: Record<UnitType, UnitStats> = {
  melee: {
    hp: 15,
    range: 1,
    movement: 5,
    damage: 5,
    description: 'Unidades cuerpo a cuerpo con alto HP',
    stats: 'HP: 15 | Alcance: 1 | Especialidad: combate frontal',
    bgColor: 'bg-red-900',
    hoverColor: 'hover:bg-red-800',
    borderColor: 'border-red-700',
  },
  ranged: {
    hp: 10,
    range: 5,
    movement: 3,
    damage: 3,
    description: 'Unidades de ataque a distancia',
    stats: 'HP: 10 | Alcance: 5 | Especialidad: ataques de largo alcance',
    bgColor: 'bg-blue-900',
    hoverColor: 'hover:bg-blue-800',
    borderColor: 'border-blue-700',
  },
  normal: {
    hp: 12,
    range: 3,
    movement: 4,
    damage: 4,
    description: 'Unidades versátiles equilibradas',
    stats: 'HP: 12 | Alcance: 3 | Especialidad: adaptabilidad',
    bgColor: 'bg-amber-800',
    hoverColor: 'hover:bg-amber-700',
    borderColor: 'border-amber-600',
  },
}

/**
 * Unit icon paths or configurations for the UI
 */
export const UNIT_ICON_CONFIGS = {
  melee: {
    path: 'M6 18L18 6M6 6l12 12',
    viewBox: '0 0 24 24',
  },
  ranged: {
    path: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5',
    viewBox: '0 0 24 24',
  },
  normal: {
    path: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
    viewBox: '0 0 24 24',
  },
}

/**
 * Generate unit icon component
 */
export function getUnitIcon(type: UnitType) {
  const iconConfig = UNIT_ICON_CONFIGS[type]

  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'h-10 w-10 text-white',
    viewBox: iconConfig.viewBox,
    fill: 'none',
    stroke: 'currentColor',
    children: React.createElement('path', {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: 2,
      d: iconConfig.path,
    }),
  })
}

/**
 * Get all stats for a unit type
 */
export function getUnitStats(type: UnitType): UnitStats {
  return UNIT_CONFIGS[type]
}

/**
 * Generate deployment positions for units
 */
export function generateDeployPositions(
  unitCounts: Record<UnitType, number>,
  isHost: boolean,
  playerId: string,
  matchId: string
) {
  const piecesToInsert: Piece[] = []
  const startY = isHost ? 15 : 0
  const endY = isHost ? 19 : 4
  let positionCounter = 0

  // Helper function to add pieces
  const addPieces = (type: UnitType, count: number) => {
    const stats = getUnitStats(type)

    for (let i = 0; i < count; i++) {
      const x = positionCounter % 20
      const y = startY + Math.floor(positionCounter / 20)

      if (y <= endY) {
        piecesToInsert.push({
          hp: stats.hp,
          player_id: playerId,
          match_id: matchId,
          pos_x: x,
          pos_y: y,
          range: stats.range,
          movement: stats.movement,
          type: type,
        })
      }

      positionCounter++
    }
  }

  // Add each type of unit
  addPieces('melee', unitCounts.melee)
  addPieces('ranged', unitCounts.ranged)
  addPieces('normal', unitCounts.normal)

  return piecesToInsert
}
