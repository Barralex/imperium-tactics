// MatchesLobby.tsx
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
import { Match } from '@/types'

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

  // Función para el botón de recarga
  const handleRefresh = () => {
    refetch()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con título, botón de recarga y botón de crear partida */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="battlefields-section mb-4 md:mb-0">
          <h2 className="battlefields-title">Campos de Batalla</h2>
        </div>

        <div className="flex space-x-3">
          {/* Botón de recargar */}
          <LoadingButton
            onClick={handleRefresh}
            isLoading={loading}
            loadingText=""
            className="bg-gray-800 hover:bg-gray-700 text-amber-400 px-4 py-3 border border-amber-900/30"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Actualizar
          </LoadingButton>

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
      </div>

      {matches.length === 0 ? (
        <EmptyState
          onCreateMatch={() => setIsModalOpen(true)}
          isAuthenticated={isAuthenticated}
          isCreating={creatingMatch}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
