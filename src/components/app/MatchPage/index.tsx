import React from 'react'
import BattleBoard from './BattleBoard'
import LoadingScreen from './LoadingScreen'
import UnitSelectionModal from './UnitSelectionModal'
import { useMatchPage } from '../../../hooks/useMatchPage'
import {
  BackButton,
  Header,
  PlayersList,
  BattleCommands,
  BattleArea,
} from './BattleComponents'

const MatchPage: React.FC = () => {
  const {
    matchId,
    currentPlayerId,
    connectedPlayers,
    isModalOpen,
    loading,
    error,
    leavingMatch,
    handleLeaveMatch,
    handleStartBattle,
    handleBackToLobby,
    handleDeployUnit,
    handleCloseModal,
    isStartingBattle,
  } = useMatchPage()

  if (loading) return <LoadingScreen />

  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>

  return (
    <div className="text-white h-screen overflow-hidden">
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxUnits={(connectedPlayers?.total_units ?? 0) / 2}
        playerId={currentPlayerId}
        matchId={matchId}
        playerId1={connectedPlayers?.player?.id}
      />

      <BackButton onClick={handleBackToLobby} />

      <Header
        title={connectedPlayers?.match_title || `Partida ${matchId}`}
        status={connectedPlayers?.status}
      />

      <div className="max-w-5xl mx-auto px-4 mt-4 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 bg-gray-900/80 rounded-lg border border-gray-800 p-4">
          <PlayersList
            connectedPlayers={connectedPlayers}
            onLeaveMatch={handleLeaveMatch}
            leavingMatch={leavingMatch}
          />

          <BattleCommands
            status={connectedPlayers?.status}
            hasOpponent={!!connectedPlayers?.playerByPlayer2Id}
            totalUnits={connectedPlayers?.total_units}
            onStartBattle={handleStartBattle}
            onDeployUnit={handleDeployUnit}
            isHost={connectedPlayers?.player.id === currentPlayerId}
            loading={isStartingBattle}
          />
        </div>

        <div className="lg:w-2/3">
          <BattleArea
            status={connectedPlayers?.status}
            isActive={
              connectedPlayers?.status === 'in_progress' ||
              connectedPlayers?.status === 'deployment' ||
              connectedPlayers?.status === 'finished'
            }
          >
            <BattleBoard />
          </BattleArea>
        </div>
      </div>
    </div>
  )
}

export default MatchPage
