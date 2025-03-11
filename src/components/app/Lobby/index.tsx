// Lobby/index.tsx
import React from 'react'
import { useMatches } from '@/hooks/useMatches'
import { EmptyState, ErrorDisplay, LoadingSkeleton } from './UIComponents'
import { CardGrid, LobbyContainer, LobbyHeader } from './StyledElements'
import { CreateButton, RefreshButton } from './ActionButtons'
import { Match } from '@/types'
import MatchCard from './MatchCard'
import CreateMatchModal from './CreateMatchModal'


/**
 * Componente principal del lobby que muestra la lista de partidas disponibles
 */
const Lobby: React.FC = () => {
  const {
    isAuthenticated,
    currentPlayerId,
    loading,
    error,
    matches,
    creatingMatch,
    joiningMatchId,
    joiningMatch,
    deletingMatchId,
    isModalOpen,
    setIsModalOpen,
    refetch,
    handleCreateMatch,
    handleEnterMatch,
    handleDeleteMatch,
  } = useMatches()

  // Si está cargando y no hay partidas, mostrar skeleton
  if (loading && !matches.length) {
    return <LoadingSkeleton />
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return <ErrorDisplay message={error.message} onRetry={refetch} />
  }

  return (
    <LobbyContainer>
      {/* Encabezado con título y botones de acción */}
      <LobbyHeader>
        <div className="battlefields-section mb-4 md:mb-0">
          <h2 className="battlefields-title">Campos de Batalla</h2>
        </div>

        <div className="flex space-x-3">
          <RefreshButton onClick={refetch} isLoading={loading} />
          
          {isAuthenticated && (
            <CreateButton 
              onClick={() => setIsModalOpen(true)} 
              isLoading={creatingMatch} 
            />
          )}
        </div>
      </LobbyHeader>

      {/* Lista de partidas o estado vacío */}
      {matches.length === 0 ? (
        <EmptyState
          onCreateMatch={() => setIsModalOpen(true)}
          isAuthenticated={isAuthenticated}
          isCreating={creatingMatch}
        />
      ) : (
        <CardGrid>
          {matches.map((match: Match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentPlayerId={currentPlayerId}
              isAuthenticated={isAuthenticated}
              joiningMatchId={joiningMatchId}
              joiningMatch={joiningMatch}
              deletingMatchId={deletingMatchId}
              onEnterMatch={handleEnterMatch}
              onDeleteMatch={handleDeleteMatch}
            />
          ))}
        </CardGrid>
      )}

      {/* Modal para crear una nueva partida */}
      {isModalOpen && (
        <CreateMatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isLoading={creatingMatch}
          onSubmit={handleCreateMatch}
        />
      )}
    </LobbyContainer>
  )
}

export default Lobby