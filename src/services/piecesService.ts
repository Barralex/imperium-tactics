// src/services/piecesService.ts
import { graphqlService } from './graphqlService'
import {
  INSERT_PIECES,
  update_pieces_by_pk,
  GET_PIECES,
  PIECES_SUBSCRIPTION,
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
}
