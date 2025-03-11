import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

import {
  BackButton,
  Header,
  PlayersList,
  BattleCommands,
  BattleArea,
} from './BattleComponents'
import { useGameplayStore } from '@/stores'
import LoadingScreen from './UI/LoadingScreen'
import UnitSelection from './Modals/UnitSelection'
import Board from './Board'

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth0()
  const playerId = user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

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

  // Verificar si el jugador actual ha desplegado unidades
  const playerPieces = pieces.filter((piece) => piece.player_id === playerId)
  const hasDeployedUnits = playerPieces.length > 0

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

  if (loading && !matchDetails) {
    return <LoadingScreen />
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error.message}</p>
  }

  return (
    <div className="text-white h-screen overflow-hidden">
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

      <div className="max-w-5xl mx-auto px-4 mt-4 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 bg-gray-900/80 rounded-lg border border-gray-800 p-4">
          <PlayersList
            connectedPlayers={matchDetails}
            onLeaveMatch={handleLeaveMatch}
            leavingMatch={leavingMatch}
          />

          <BattleCommands
            status={matchDetails?.status}
            hasOpponent={!!matchDetails?.playerByPlayer2Id}
            totalUnits={matchDetails?.total_units}
            onStartBattle={handleStartBattle}
            onPhaseChange={handleUpdateBattle}
            onDeployUnit={openDeploymentModal}
            isHost={matchDetails?.player?.id === playerId}
            loading={isStartingBattle}
            hasDeployedUnits={hasDeployedUnits}
          />
        </div>

        <div className="lg:w-2/3">
          <BattleArea
            status={matchDetails?.status}
            isActive={
              matchDetails?.status === 'in_progress' ||
              matchDetails?.status === 'deployment' ||
              matchDetails?.status === 'finished'
            }
          >
            <Board />
          </BattleArea>
        </div>
      </div>
    </div>
  )
}

export default MatchPage
