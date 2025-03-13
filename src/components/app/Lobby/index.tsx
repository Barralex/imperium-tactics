// Lobby/index.tsx
import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useMatchesStore } from '@/stores'
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
  const { user, isAuthenticated } = useAuth0()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Extraer ID del jugador de los claims de Auth0
  const currentPlayerId =
    user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  // Obtener estado y acciones del store
  const {
    matches,
    loading,
    error,
    joiningMatchId,
    creatingMatch,
    deletingMatchId,
    fetchMatches,
    createMatch,
    joinMatch,
    deleteMatch,
  } = useMatchesStore()

  // Cargar partidas cuando el componente se monte
  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  // Si está cargando y no hay partidas, mostrar skeleton
  if (loading && !matches.length) {
    return <LoadingSkeleton />
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return <ErrorDisplay message={error.message} onRetry={fetchMatches} />
  }

  // Manejadores de eventos
  const handleCreateMatch = async (name: string, totalUnits: number) => {
    // Verificar que el ID del usuario esté disponible
    if (!currentPlayerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    try {
      await createMatch(currentPlayerId, name, totalUnits * 2)
      // Cerrar el modal después de crear la partida exitosamente
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error al crear partida:', error)
    }
  }

  const handleEnterMatch = (match: Match) => {
    if (!isAuthenticated || !user) {
      return
    }

    if (!currentPlayerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    // Verificar si el usuario es el creador de la partida
    if (match.player1_id === currentPlayerId) {
      // Si es el creador, solo redirigir
      console.log('🔄 Redirigiendo al creador a su partida')
      navigate(`/match/${match.id}`)
      return
    }

    // Si no es el creador y la partida no tiene un segundo jugador, unirse
    if (!match.player2_id) {
      joinMatch(match.id, currentPlayerId).then((success) => {
        if (success) {
          navigate(`/match/${match.id}`)
        }
      })
    } else if (match.player2_id === currentPlayerId) {
      navigate(`/match/${match.id}`)
    } else {
      alert('❌ Esta partida ya tiene dos jugadores y no eres uno de ellos')
    }
  }

  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta partida?')) {
      deleteMatch(matchId)
    }
  }

  return (
    <LobbyContainer>
      {/* Encabezado con título y botones de acción */}
      <LobbyHeader>
        <div className="battlefields-section mb-4 md:mb-0">
          <h2 className="battlefields-title">Campos de Batalla</h2>
        </div>

        <div className="flex space-x-3">
          <RefreshButton onClick={fetchMatches} isLoading={loading} />

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
              joiningMatch={joiningMatchId !== null}
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
