// src/services/piecesService.ts
import { graphqlService } from './graphqlService'
import {
  INSERT_PIECES,
  update_pieces_by_pk,
  GET_PIECES,
  PIECES_SUBSCRIPTION,
  GET_PIECES_BY_PK,
  ATTACK_PIECE,
  MARK_PIECE_AS_DEAD,
} from '../graphql/matches'
import { Piece } from '@/types'
import { ApolloError } from '@apollo/client'

// Define el tipo de la suscripción
type Subscription = {
  unsubscribe: () => void
}

/**
 * Servicio para la gestión de piezas en el tablero
 */
export const piecesService = {
  /**
   * Obtiene todas las piezas de una partida
   */
  getPieces: async (matchId: string): Promise<Piece[]> => {
    try {
      const { data } = await graphqlService.query<{ pieces: Piece[] }>({
        query: GET_PIECES,
        variables: { matchId },
      })
      return data.pieces || []
    } catch (error) {
      throw new Error(
        'Error al cargar piezas: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  },

  /**
   * Actualiza la posición de una pieza
   */
  updatePiecePosition: async (
    pieceId: string,
    posX: number,
    posY: number
  ): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: update_pieces_by_pk,
        variables: {
          id: pieceId,
          pos_x: posX,
          pos_y: posY,
        },
      })

      if (errors) throw new Error('Error al actualizar la posición de la pieza')
    } catch (error) {
      throw new Error(
        'Error al actualizar la posición: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  },

  /**
   * Despliega unidades en el tablero
   */
  deployUnits: async (
    matchId: string,
    playerId: string,
    units: {
      melee: number
      ranged: number
      normal: number
    },
    isHost: boolean
  ): Promise<void> => {
    try {
      const piecesToInsert = []
      let positionCounter = 0
      const startY = isHost ? 15 : 0
      const endY = isHost ? 19 : 4

      // Crear unidades de tipo melee
      for (let i = 0; i < units.melee; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 15,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 0,
            movement: 2,
            type: 'melee',
          })
        }
        positionCounter++
      }

      // Crear unidades de tipo ranged
      for (let i = 0; i < units.ranged; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 10,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 2,
            movement: 1,
            type: 'ranged',
          })
        }
        positionCounter++
      }

      // Crear unidades de tipo normal
      for (let i = 0; i < units.normal; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 12,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 1,
            movement: 1,
            type: 'normal',
          })
        }
        positionCounter++
      }

      const { errors } = await graphqlService.mutate({
        mutation: INSERT_PIECES,
        variables: {
          objects: piecesToInsert,
        },
      })

      if (errors) throw new Error('Error al desplegar las unidades')
    } catch (error) {
      throw new Error(
        'Error al desplegar unidades: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  },

  /**
   * Suscribe a cambios en las piezas del tablero
   */
  subscribeToPieces: (
    matchId: string,
    onData: (pieces: Piece[]) => void,
    onError?: (error: ApolloError) => void
  ): Subscription => {
    return graphqlService.subscribe<{ pieces: Piece[] }>(
      PIECES_SUBSCRIPTION,
      { matchId },
      (data) => {
        if (data.pieces) {
          onData(data.pieces)
        }
      },
      (error) => {
        if (onError) {
          onError(error as ApolloError)
        }
      }
    )
  },

  /**
   * Ataca a una pieza y reduce su HP
   */
  attackPiece: async (
    pieceId: string,
    damage: number
  ): Promise<{ id: string; hp: number }> => {
    try {
      // Primero obtenemos el HP actual
      const { data: pieceData } = await graphqlService.query<{
        pieces_by_pk: { id: string; hp: number; player_id: string }
      }>({
        query: GET_PIECES_BY_PK,
        variables: { id: pieceId },
      })

      if (!pieceData || !pieceData.pieces_by_pk) {
        throw new Error('Pieza no encontrada')
      }

      // Calcular el nuevo HP
      const currentHp = pieceData.pieces_by_pk.hp
      const newHp = Math.max(0, currentHp - damage)

      // Actualizar con el nuevo HP
      const { data, errors } = await graphqlService.mutate<{
        update_pieces_by_pk: { id: string; hp: number; player_id: string }
      }>({
        mutation: ATTACK_PIECE,
        variables: {
          id: pieceId,
          newHp: newHp,
        },
      })

      if (errors) throw new Error('Error al atacar la pieza')

      // Si la HP llega a 0, eliminar o marcar como muerta
      if (newHp <= 0) {
        await piecesService.deletePiece(pieceId)
      }

      return {
        id: data.update_pieces_by_pk.id,
        hp: data.update_pieces_by_pk.hp,
      }
    } catch (error) {
      throw new Error(
        'Error al atacar: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  },

  /**
   * Elimina una pieza del tablero
   */
  deletePiece: async (pieceId: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: MARK_PIECE_AS_DEAD,
        variables: {
          id: pieceId,
        },
      })

      if (errors) throw new Error('Error al eliminar la pieza')
    } catch (error) {
      throw new Error(
        'Error al eliminar la pieza: ' +
          (error instanceof Error ? error.message : String(error))
      )
    }
  },

  /**
   * Verifica si una pieza puede atacar a otra
   */
  canAttack: (attacker: Piece, target: Piece): boolean => {
    // Verificar que las piezas sean de jugadores diferentes
    if (attacker.player_id === target.player_id) return false

    // Calcular la distancia Manhattan entre las piezas
    const distance =
      Math.abs(attacker.pos_x - target.pos_x) +
      Math.abs(attacker.pos_y - target.pos_y)

    // Verificar si el objetivo está dentro del rango de ataque
    return distance <= attacker.range
  },

  /**
   * Calcula el daño base según el tipo de unidad
   */
  calculateDamage: (attacker: Piece): number => {
    switch (attacker.type) {
      case 'melee':
        return 5 // Las unidades melee hacen más daño
      case 'ranged':
        return 3 // Las unidades ranged hacen daño medio
      case 'normal':
        return 4 // Las unidades normales tienen daño equilibrado
      default:
        return 3
    }
  },
}
