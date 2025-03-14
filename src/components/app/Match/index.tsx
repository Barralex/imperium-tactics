// src/components/app/Match/index.tsx - Layout actualizado
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useMutation } from '@apollo/client'

import {
  BackButton,
  Header,
  PlayersList,
  BattleCommands,
  BattleArea,
} from './UI/BattleComponents'
import { useGameplayStore } from '@/stores'
import LoadingScreen from './UI/LoadingScreen'
import UnitSelection from './Modals/UnitSelection'
import Board from './Board' // Usamos el componente Board existente
import { UPDATE_MATCH } from '@/graphql/matches'
import AttackControls from './CombatSystem/AttackControls'

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  useEffect(() => {
    if (matchId) {
      localStorage.setItem('currentMatchId', matchId)
    }
    return () => {
      localStorage.removeItem('currentMatchId')
    }
  }, [matchId])
  const navigate = useNavigate()
  const { user } = useAuth0()
  const playerId = user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  // Estado para seguir el ID del jugador con el turno actual
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<
    string | undefined
  >(undefined)

  // Referencia a la mutación para actualizar el turno
  const [updateMatchTurn] = useMutation(UPDATE_MATCH)

  const {
    matchDetails,
    pieces,
    loading,
    error,
    leavingMatch,
    isDeploymentModalOpen,
    isStartingBattle,
    subscribeToMatch,
    unsubscribeFromMatch,
    subscribeToPieces,
    unsubscribeFromPieces,
    startBattle,
    updateBattlePhase,
    leaveMatch,
    openDeploymentModal,
    closeDeploymentModal,
  } = useGameplayStore()

  // Suscribirse a los cambios en la partida y las piezas
  useEffect(() => {
    if (matchId) {
      subscribeToMatch(matchId)
      subscribeToPieces(matchId)
    }

    return () => {
      unsubscribeFromMatch()
      unsubscribeFromPieces()
    }
  }, [
    matchId,
    subscribeToMatch,
    subscribeToPieces,
    unsubscribeFromMatch,
    unsubscribeFromPieces,
  ])

  // Actualizar el estado local cuando cambia matchDetails
  useEffect(() => {
    if (matchDetails) {
      // Si no hay un turno asignado y el estado es "in_progress", asignar al host
      if (matchDetails.status === 'in_progress' && !matchDetails.turn) {
        handleAssignFirstTurn()
      } else if (matchDetails.turn) {
        setCurrentTurnPlayerId(matchDetails.turn)
      }
    }
  }, [matchDetails])

  // Verificar si el jugador actual ha desplegado unidades
  const playerPieces = pieces.filter((piece) => piece.player_id === playerId)
  const hasDeployedUnits = playerPieces.length > 0

  // Verificar si el jugador es el host
  const isHost = matchDetails?.player?.id === playerId

  const handleLeaveMatch = async () => {
    if (matchId) {
      await leaveMatch(matchId)
      navigate('/')
    }
  }

  const handleStartBattle = () => {
    if (matchId) {
      startBattle(matchId)
    }
  }

  const handleBackToLobby = () => {
    navigate('/')
  }

  const handleUpdateBattle = () => {
    if (matchId) {
      updateBattlePhase(matchId, 'in_progress')
    }
  }

  // Asignar el primer turno al host cuando la partida comienza
  const handleAssignFirstTurn = async () => {
    if (matchId && matchDetails?.player?.id && isHost) {
      try {
        await updateMatchTurn({
          variables: {
            matchId,
            set: { turn: matchDetails.player.id },
          },
        })
      } catch (error) {
        console.error('Error al asignar el primer turno:', error)
      }
    }
  }

  // Función para finalizar el turno y pasarlo al otro jugador
  const handleEndTurn = async () => {
    if (!matchId || !matchDetails) return

    try {
      // Determinar quién es el siguiente jugador
      const nextPlayerId =
        matchDetails.player?.id === currentTurnPlayerId
          ? matchDetails.playerByPlayer2Id?.id
          : matchDetails.player?.id

      if (nextPlayerId) {
        await updateMatchTurn({
          variables: {
            matchId,
            set: { turn: nextPlayerId },
          },
        })
      }
    } catch (error) {
      console.error('Error al cambiar de turno:', error)
    }
  }

  if (loading && !matchDetails) {
    return <LoadingScreen />
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error.message}</p>
  }

  // LAYOUT MODIFICADO: Reorganizamos para que el tablero ocupe la parte superior y los controles vayan abajo
  return (
    <div className="text-white h-screen flex flex-col overflow-hidden">
      <UnitSelection
        isOpen={isDeploymentModalOpen}
        onClose={closeDeploymentModal}
        maxUnits={(matchDetails?.total_units ?? 0) / 2}
        matchId={matchId}
        playerId={playerId}
        playerId1={matchDetails?.player?.id}
      />
      <BackButton onClick={handleBackToLobby} />
      <Header
        title={matchDetails?.match_title || `Partida ${matchId}`}
        status={matchDetails?.status}
      />
      <div className="w-8"></div> {/* Espaciador para centrar el título */}
      {/* Área del tablero - Ocupa la mayor parte del espacio disponible */}
      <div className="flex-grow overflow-auto bg-gray-900/50">
        <BattleArea
          status={matchDetails?.status}
          isActive={
            matchDetails?.status === 'in_progress' ||
            matchDetails?.status === 'deployment' ||
            matchDetails?.status === 'finished'
          }
        >
          <Board
            currentPlayerId={playerId}
            activeTurnPlayerId={currentTurnPlayerId}
            matchDetails={matchDetails}
          />
        </BattleArea>
      </div>
      {/* Panel de control en la parte inferior */}
      <div className="bg-gray-900 border-t border-amber-900/50 p-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Información de jugadores */}
          <div className="bg-gray-900/80 rounded-lg border border-gray-800 p-3">
            <PlayersList
              connectedPlayers={matchDetails}
              onLeaveMatch={handleLeaveMatch}
              leavingMatch={leavingMatch}
            />
          </div>

          {/* Comandos de batalla */}
          <div className="bg-gray-900/80 rounded-lg border border-gray-800 p-3">
            <BattleCommands
              status={matchDetails?.status}
              hasOpponent={!!matchDetails?.playerByPlayer2Id}
              totalUnits={matchDetails?.total_units}
              onStartBattle={handleStartBattle}
              onPhaseChange={handleUpdateBattle}
              onDeployUnit={openDeploymentModal}
              onEndTurn={handleEndTurn}
              isHost={isHost}
              loading={isStartingBattle}
              hasDeployedUnits={hasDeployedUnits}
              isMyTurn={playerId === currentTurnPlayerId}
              currentTurn={1}
            />
          </div>

          {/* Sistema de combate */}
          <div className="bg-gray-900/80 rounded-lg border border-gray-800 p-3">
            {matchDetails?.status === 'in_progress' && (
              <AttackControls
                currentPlayerId={playerId}
                isPlayerTurn={playerId === currentTurnPlayerId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchPage
