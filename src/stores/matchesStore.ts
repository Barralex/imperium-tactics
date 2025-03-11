// src/stores/matches/matchesStore.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Match } from '@/types'
import { matchesService } from '@/services/matchesService'

interface MatchesState {
  matches: Match[]
  loading: boolean
  error: Error | null
  joiningMatchId: string | null
  creatingMatch: boolean
  deletingMatchId: string | null

  // Acciones
  fetchMatches: () => Promise<void>
  createMatch: (
    playerId: string,
    title: string,
    totalUnits: number
  ) => Promise<void>
  joinMatch: (matchId: string, playerId: string) => Promise<boolean>
  deleteMatch: (matchId: string) => Promise<void>
  resetError: () => void
}

export const useMatchesStore = create<MatchesState>()(
  immer((set, get) => ({
    matches: [],
    loading: false,
    error: null,
    joiningMatchId: null,
    creatingMatch: false,
    deletingMatchId: null,

    fetchMatches: async () => {
      set((state) => {
        state.loading = true
        state.error = null
      })

      try {
        const matches = await matchesService.getMatches()
        set((state) => {
          state.matches = matches
          state.loading = false
        })
      } catch (error) {
        set((state) => {
          state.error = error as Error
          state.loading = false
        })
      }
    },

    createMatch: async (playerId, title, totalUnits) => {
      set((state) => {
        state.creatingMatch = true
        state.error = null
      })

      try {
        await matchesService.createMatch(playerId, title, totalUnits)
        await get().fetchMatches() // Refrescar la lista después de crear
        set((state) => {
          state.creatingMatch = false
        })
      } catch (error) {
        set((state) => {
          state.error = error as Error
          state.creatingMatch = false
        })
      }
    },

    joinMatch: async (matchId, playerId) => {
      set((state) => {
        state.joiningMatchId = matchId
        state.error = null
      })

      try {
        await matchesService.joinMatch(matchId, playerId)
        set((state) => {
          state.joiningMatchId = null
        })
        return true // Para señalizar que podemos navegar
      } catch (error) {
        set((state) => {
          state.error = error as Error
          state.joiningMatchId = null
        })
        return false
      }
    },

    deleteMatch: async (matchId) => {
      set((state) => {
        state.deletingMatchId = matchId
        state.error = null
      })

      try {
        await matchesService.deleteMatch(matchId)
        await get().fetchMatches() // Refrescar la lista después de eliminar
        set((state) => {
          state.deletingMatchId = null
        })
      } catch (error) {
        set((state) => {
          state.error = error as Error
          state.deletingMatchId = null
        })
      }
    },

    resetError: () => {
      set((state) => {
        state.error = null
      })
    },
  }))
)
