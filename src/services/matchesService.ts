import { graphqlService } from './graphqlService'
import {
  GET_MATCHES,
  CREATE_MATCH,
  JOIN_MATCH,
  DELETE_MATCH,
  LEAVE_MATCH,
  UPDATE_MATCH,
  GET_MATCH_SUBSCRIPTION,
} from '../graphql/matches'
import { Match, MatchDetails } from '@/types'
import { ApolloError } from '@apollo/client'

// Define el tipo de la suscripción
type Subscription = {
  unsubscribe: () => void
}

/**
 * Servicio para la gestión de partidas
 */
export const matchesService = {
  /**
   * Obtiene todas las partidas disponibles
   */
  getMatches: async (): Promise<Match[]> => {
    try {
      const { data } = await graphqlService.query<{ matches: Match[] }>({
        query: GET_MATCHES,
      })
      return data.matches || []
    } catch (error) {
      throw new Error(
        `Error al obtener partidas: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Crea una nueva partida
   */
  createMatch: async (
    playerId: string,
    title: string,
    totalUnits: number
  ): Promise<Match> => {
    try {
      const { data, errors } = await graphqlService.mutate<{
        insert_matches_one: Match
      }>({
        mutation: CREATE_MATCH,
        variables: {
          player1_id: playerId,
          match_title: title,
          total_units: totalUnits,
        },
      })

      if (errors) throw new Error('Error al crear la partida')
      return data.insert_matches_one
    } catch (error) {
      throw new Error(
        `Error al crear partida: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Permite a un jugador unirse a una partida existente
   */
  joinMatch: async (matchId: string, playerId: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: JOIN_MATCH,
        variables: {
          matchId,
          player2_id: playerId,
        },
      })

      if (errors) throw new Error('Error al unirse a la partida')
    } catch (error) {
      throw new Error(
        `Error al unirse a la partida: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Elimina una partida existente
   */
  deleteMatch: async (matchId: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: DELETE_MATCH,
        variables: {
          matchId,
        },
      })

      if (errors) throw new Error('Error al eliminar la partida')
    } catch (error) {
      throw new Error(
        `Error al eliminar la partida: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Permite a un jugador abandonar una partida
   */
  leaveMatch: async (matchId: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: LEAVE_MATCH,
        variables: {
          matchId,
        },
      })

      if (errors) throw new Error('Error al abandonar la partida')
    } catch (error) {
      throw new Error(
        `Error al abandonar la partida: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Suscribe a los cambios en una partida específica
   */
  subscribeToMatch: (
    matchId: string,
    onData: (data: MatchDetails) => void,
    onError?: (error: ApolloError) => void
  ): Subscription => {
    return graphqlService.subscribe<{ matches_by_pk: MatchDetails }>(
      GET_MATCH_SUBSCRIPTION,
      { matchId },
      (data) => {
        if (data.matches_by_pk) {
          onData(data.matches_by_pk)
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
   * Inicia una batalla (cambia el estado de la partida)
   */
  startBattle: async (matchId: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: UPDATE_MATCH,
        variables: {
          matchId,
          set: {
            status: 'deployment',
          },
        },
      })

      if (errors) throw new Error('Error al iniciar la batalla')
    } catch (error) {
      throw new Error(
        `Error al iniciar la batalla: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },

  /**
   * Actualiza la fase de una batalla
   */
  updateBattlePhase: async (matchId: string, phase: string): Promise<void> => {
    try {
      const { errors } = await graphqlService.mutate({
        mutation: UPDATE_MATCH,
        variables: {
          matchId,
          set: {
            status: phase,
          },
        },
      })

      if (errors)
        throw new Error(`Error al actualizar la fase de batalla a ${phase}`)
    } catch (error) {
      throw new Error(
        `Error al actualizar fase: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  },
}
