import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Piece, MatchDetails } from '@/types'
import { matchesService } from '@/services/matchesService'
import { piecesService } from '@/services/piecesService'

// Define el tipo de la suscripción
type Subscription = {
  unsubscribe: () => void
}

interface GameplayState {
  matchDetails: MatchDetails | null
  pieces: Piece[]
  loading: boolean
  error: Error | null
  selectedPiece: Piece | null
  isDeploymentModalOpen: boolean
  leavingMatch: boolean
  isStartingBattle: boolean
  unitDeploymentProgress: {
    isDeploying: boolean
    error: string | null
    hasDeployed: boolean
  }
  attackingPiece: Piece | null
  targetedPiece: Piece | null
  attackResult: {
    success: boolean
    message: string
    damage: number | null
  } | null

  // Acciones
  subscribeToMatch: (matchId: string) => void
  unsubscribeFromMatch: () => void
  subscribeToPieces: (matchId: string) => void
  unsubscribeFromPieces: () => void
  startBattle: (matchId: string) => Promise<void>
  updateBattlePhase: (matchId: string, phase: string) => Promise<void>
  leaveMatch: (matchId: string) => Promise<void>
  selectPiece: (piece: Piece | null) => void
  movePiece: (pieceId: string, x: number, y: number) => Promise<void>
  deployUnits: (
    matchId: string,
    playerId: string,
    units: { melee: number; ranged: number; normal: number },
    isHost: boolean
  ) => Promise<void>
  openDeploymentModal: () => void
  closeDeploymentModal: () => void
  resetError: () => void

  // Nuevas acciones para el sistema de combate
  setAttackingPiece: (piece: Piece | null) => void
  setTargetedPiece: (piece: Piece | null) => void
  canAttack: (attacker: Piece, target: Piece) => boolean
  performAttack: () => Promise<void>
  clearAttackResult: () => void
}

export const useGameplayStore = create<GameplayState>()(
  immer((set, get) => {
    // Referencias a las suscripciones
    let matchSubscription: Subscription | null = null
    let piecesSubscription: Subscription | null = null

    return {
      matchDetails: null,
      pieces: [],
      loading: true,
      error: null,
      selectedPiece: null,
      isDeploymentModalOpen: false,
      leavingMatch: false,
      isStartingBattle: false,
      unitDeploymentProgress: {
        isDeploying: false,
        error: null,
        hasDeployed: false,
      },
      attackingPiece: null,
      targetedPiece: null,
      attackResult: null,

      // Suscripciones
      subscribeToMatch: (matchId) => {
        // Cancelamos cualquier suscripción existente
        if (matchSubscription) {
          matchSubscription.unsubscribe()
        }

        set((state) => {
          state.loading = true
        })

        matchSubscription = matchesService.subscribeToMatch(
          matchId,
          (data) => {
            set((state) => {
              state.matchDetails = data
              state.loading = false

              // Actualizar hasDeployed basado en piezas desplegadas
              if (data && get().pieces.length > 0) {
                const playerId = data.player?.id
                const playerPieces = get().pieces.filter(
                  (p) => p.player_id === playerId
                )
                state.unitDeploymentProgress.hasDeployed =
                  playerPieces.length > 0
              }
            })
          },
          (error) => {
            set((state) => {
              state.error = error as Error
              state.loading = false
            })
          }
        )
      },

      unsubscribeFromMatch: () => {
        if (matchSubscription) {
          matchSubscription.unsubscribe()
          matchSubscription = null
        }

        set((state) => {
          state.matchDetails = null
        })
      },

      subscribeToPieces: (matchId) => {
        // Cancelamos cualquier suscripción existente
        if (piecesSubscription) {
          piecesSubscription.unsubscribe()
        }

        piecesSubscription = piecesService.subscribeToPieces(
          matchId,
          (data) => {
            set((state) => {
              state.pieces = data

              // Actualizar hasDeployed basado en piezas
              if (state.matchDetails) {
                const playerId = state.matchDetails.player?.id
                const playerPieces = data.filter(
                  (p) => p.player_id === playerId
                )
                state.unitDeploymentProgress.hasDeployed =
                  playerPieces.length > 0
              }
            })
          },
          (error) => {
            set((state) => {
              state.error = error as Error
            })
          }
        )
      },

      unsubscribeFromPieces: () => {
        if (piecesSubscription) {
          piecesSubscription.unsubscribe()
          piecesSubscription = null
        }

        set((state) => {
          state.pieces = []
        })
      },

      // Acciones del juego
      startBattle: async (matchId) => {
        set((state) => {
          state.isStartingBattle = true
          state.error = null
        })

        try {
          await matchesService.startBattle(matchId)
          set((state) => {
            state.isStartingBattle = false
          })
        } catch (error) {
          set((state) => {
            state.error = error as Error
            state.isStartingBattle = false
          })
        }
      },

      updateBattlePhase: async (matchId, phase) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          await matchesService.updateBattlePhase(matchId, phase)
          set((state) => {
            state.loading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error as Error
            state.loading = false
          })
        }
      },

      leaveMatch: async (matchId) => {
        set((state) => {
          state.leavingMatch = true
          state.error = null
        })

        try {
          await matchesService.leaveMatch(matchId)
          set((state) => {
            state.leavingMatch = false
          })
        } catch (error) {
          set((state) => {
            state.error = error as Error
            state.leavingMatch = false
          })
        }
      },

      selectPiece: (piece) => {
        set((state) => {
          state.selectedPiece = piece
        })
      },

      movePiece: async (pieceId, x, y) => {
        try {
          await piecesService.updatePiecePosition(pieceId, x, y)
          // No actualizamos el estado aquí porque la suscripción lo hará
        } catch (error) {
          set((state) => {
            state.error = error as Error
          })
        }
      },

      deployUnits: async (matchId, playerId, units, isHost) => {
        set((state) => {
          state.unitDeploymentProgress.isDeploying = true
          state.unitDeploymentProgress.error = null
        })

        try {
          await piecesService.deployUnits(matchId, playerId, units, isHost)
          set((state) => {
            state.unitDeploymentProgress.isDeploying = false
            state.unitDeploymentProgress.hasDeployed = true
            state.isDeploymentModalOpen = false
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)
          set((state) => {
            state.unitDeploymentProgress.error = errorMessage
            state.unitDeploymentProgress.isDeploying = false
          })
        }
      },

      openDeploymentModal: () => {
        set((state) => {
          state.isDeploymentModalOpen = true
        })
      },

      closeDeploymentModal: () => {
        set((state) => {
          state.isDeploymentModalOpen = false
        })
      },

      resetError: () => {
        set((state) => {
          state.error = null
          state.unitDeploymentProgress.error = null
        })
      },

      // Nuevas acciones para el sistema de combate
      setAttackingPiece: (piece) => {
        set((state) => {
          state.attackingPiece = piece
          // Si deseleccionamos la pieza atacante, también limpiamos el objetivo
          if (!piece) {
            state.targetedPiece = null
          }
        })
      },

      setTargetedPiece: (piece) => {
        set((state) => {
          state.targetedPiece = piece
        })
      },

      canAttack: (attacker, target) => {
        return piecesService.canAttack(attacker, target)
      },

      performAttack: async () => {
        const { attackingPiece, targetedPiece } = get();
      
        if (!attackingPiece || !targetedPiece) {
          set((state) => {
            state.attackResult = {
              success: false,
              message: 'Selecciona una pieza atacante y un objetivo',
              damage: null,
            };
          });
          return;
        }
      
        // Verificar si puede atacar al objetivo
        if (!piecesService.canAttack(attackingPiece, targetedPiece)) {
          set((state) => {
            state.attackResult = {
              success: false,
              message: 'El objetivo está fuera de rango',
              damage: null,
            };
          });
          return;
        }
      
        try {
          // Calcular el daño
          const damage = piecesService.calculateDamage(attackingPiece);
      
          // Verificar si el daño es suficiente para matar a la pieza
          const willDie = targetedPiece.hp <= damage;
      
          // Realizar el ataque
          if (targetedPiece.id) {
            await piecesService.attackPiece(targetedPiece.id, damage);
          } else {
            throw new Error('ID de la pieza objetivo indefinido');
          }
      
          set((state) => {
            state.attackResult = {
              success: true,
              message: willDie 
                ? `¡Ataque mortal! Causaste ${damage} puntos de daño y has eliminado a la unidad enemiga.` 
                : `¡Ataque exitoso! Causaste ${damage} puntos de daño. La unidad enemiga sobrevive con ${targetedPiece.hp - damage} HP.`,
              damage: damage,
            };
            // Limpiar las selecciones después del ataque
            state.attackingPiece = null;
            state.targetedPiece = null;
          });
        } catch (error) {
          set((state) => {
            state.attackResult = {
              success: false,
              message: error instanceof Error ? error.message : String(error),
              damage: null,
            };
          });
        }
      },

      clearAttackResult: () => {
        set((state) => {
          state.attackResult = null
        })
      },
    }
  })
)
