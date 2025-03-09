import React from 'react'
import CreateMatchModal from './CreateMatchModal'
import { useMatches } from '../../../hooks/useMatches'
import {
  LoadingButton,
  ErrorDisplay,
  LoadingSkeleton,
  EmptyState,
  AddIcon,
} from './UIComponents'
import MatchCard from './MatchCard'

const MatchesLobby: React.FC = () => {
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

  if (loading && !matches.length) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error.message} onRetry={refetch} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con título y botón de crear partida */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="battlefields-section mb-4 md:mb-0">
          <h2 className="battlefields-title">Campos de Batalla</h2>
        </div>

        {isAuthenticated && (
          <LoadingButton
            onClick={() => setIsModalOpen(true)}
            isLoading={creatingMatch}
            loadingText="Creando..."
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
            icon={<AddIcon />}
          >
            Iniciar Nueva Campaña
          </LoadingButton>
        )}
      </div>

      {matches.length === 0 ? (
        <EmptyState
          onCreateMatch={() => setIsModalOpen(true)}
          isAuthenticated={isAuthenticated}
          isCreating={creatingMatch}
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
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
        </div>
      )}

      {/* Modal para crear una nueva sala */}
      {isModalOpen && (
        <CreateMatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          isLoading={creatingMatch}
          onSubmit={handleCreateMatch}
        />
      )}
    </div>
  )
}

export default MatchesLobby
