import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import CreateMatchModal from './CreateMatchModal'
import {
  GET_MATCHES,
  CREATE_MATCH,
  JOIN_MATCH,
  DELETE_MATCH,
} from '../../graphql/matches'

interface Match {
  id: string
  status: string
  created_at: string
  player1_id: string
  player2_id: string | null
  total_units: number
  match_title: string
}

const MatchesLobby: React.FC = () => {
  const { isAuthenticated, user } = useAuth0()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null)
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null)

  const currentPlayerId =
    user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  // Consulta para obtener salas en espera
  const { loading, error, data, refetch } = useQuery(GET_MATCHES, {
    pollInterval: 5000,
    onError: (err) => {
      console.error('Error con la primera consulta:', err.message)
    },
  })

  // Mutación para crear una nueva sala
  const [createMatch, { loading: creatingMatch }] = useMutation(CREATE_MATCH, {
    onCompleted: () => {
      setIsModalOpen(false)
      refetch()
    },
  })

  // Mutación para unirse a una partida existente
  const [joinMatch, { loading: joiningMatch }] = useMutation(JOIN_MATCH, {
    onCompleted: (data) => {
      console.log('✅ Unido a la partida:', data)
      // Redireccionar después de unirse exitosamente
      navigate(`/match/${joiningMatchId}`)
      setJoiningMatchId(null)
    },
    onError: (error) => {
      console.error('❌ Error al unirse a la partida:', error)
      setJoiningMatchId(null)
    },
  })

  // Mutación para eliminar una partida (solo disponible para el creador)
  const [deleteMatch, { loading: deletingMatch }] = useMutation(DELETE_MATCH, {
    onCompleted: (data) => {
      console.log('✅ Partida eliminada con éxito:', data)
      setDeletingMatchId(null)
      refetch()
    },
    onError: (error) => {
      console.error('❌ Error al eliminar la partida:', error)
      setDeletingMatchId(null)
    },
  })

  const handleCreateMatch = (name: string, totalUnits: number) => {
    // Verificar que el ID del usuario esté disponible
    if (!currentPlayerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    createMatch({
      variables: {
        player1_id: currentPlayerId,
        total_units: totalUnits,
        match_title: name, // Aquí usamos el nombre del modal como match_title
      },
    })
  }

  // Manejar la entrada a una partida
  const handleEnterMatch = (match: Match) => {
    if (!isAuthenticated || !user) {
      // Si no está autenticado, podría redirigir a login
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
      setJoiningMatchId(match.id)
      joinMatch({
        variables: {
          matchId: match.id,
          player2_id: currentPlayerId,
        },
      })
    } else if (match.player2_id === currentPlayerId) {
      navigate(`/match/${match.id}`)
    } else {
      alert('❌ Esta partida ya tiene dos jugadores y no eres uno de ellos')
    }
  }

  // Función para eliminar una partida (solo disponible para el creador)
  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta partida?')) {
      setDeletingMatchId(matchId)
      deleteMatch({
        variables: {
          matchId: matchId,
        },
      })
    }
  }

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-muted/30 w-64 rounded animate-pulse"></div>
          <div className="h-10 bg-muted/30 w-48 rounded animate-pulse"></div>
        </div>

        {[...Array(3)].map((_, index) => (
          <div key={index} className="war-zone-card mb-4 p-6 animate-pulse">
            <div>
              <div className="h-7 bg-muted rounded w-2/5 mb-3"></div>
              <div className="h-5 bg-muted/60 rounded w-1/3 mb-4"></div>
            </div>
            <div className="flex justify-end mt-4">
              <div className="h-10 bg-muted/40 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border border-destructive p-6 bg-destructive/10 rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto text-destructive mb-4 h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 9h2v6H8z" />
            <path d="M14 9h2v6h-2z" />
          </svg>
          <h2 className="text-2xl font-bold text-destructive mb-2">
            ERROR DE COMUNICACIÓN
          </h2>
          <p className="text-destructive/90 mb-4">
            Los servidores del Adeptus Mechanicus no responden: {error.message}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded imperial-button"
          >
            Reintentar conexión
          </button>
        </div>
      </div>
    )
  }

  // Lista de salas
  const matches = data?.matches || []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con título y botón de crear partida */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="battlefields-section mb-4 md:mb-0">
          <h2 className="battlefields-title">Campos de Batalla</h2>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded imperial-button flex items-center gap-2"
            disabled={creatingMatch}
          >
            {creatingMatch ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Iniciar Nueva Campaña
              </>
            )}
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="empty-state p-10 border-2 border-dashed border-muted rounded-lg text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto text-muted-foreground mb-4 h-16 w-16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <p className="empty-state-text text-xl mb-6">
            No hay zonas de guerra activas. La galaxia aguarda a que comandes
            tus fuerzas.
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded imperial-button"
              disabled={creatingMatch}
            >
              {creatingMatch
                ? 'Desplegando fuerzas...'
                : 'Iniciar Nueva Campaña'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: Match) => {
            // Determinar si el usuario actual es uno de los jugadores
            const currentPlayerId =
              user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
            const isPlayer1 = match.player1_id === currentPlayerId
            const isPlayer2 = match.player2_id === currentPlayerId
            const isFullMatch = match.player2_id !== null
            const canJoin = isAuthenticated && !isFullMatch && !isPlayer1

            return (
              <div
                key={match.id}
                className={`war-zone-card p-6 rounded transition-all duration-200 ${
                  isPlayer1 || isPlayer2 ? 'border-l-4 border-amber-500' : ''
                }`}
              >
                <div>
                  <h3 className="text-2xl font-bold flex items-center">
                    <span className="icon-sword mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 17.5L3 6M16.5 15.5L21 21M12 12L21 3M12 12L3 21" />
                      </svg>
                    </span>
                    {match.match_title || 'Zona de Guerra'}
                    {(isPlayer1 || isPlayer2) && (
                      <span className="ml-2 text-sm bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">
                        {isPlayer1 ? 'Tu Campaña' : 'Participando'}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Desplegada:{' '}
                    {new Date(match.created_at).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>

                  {/* Mostrar información sobre los jugadores y unidades */}
                  <div className="mt-2 text-sm">
                    <span className="text-amber-400">Jugadores: </span>
                    <span className={isFullMatch ? 'text-green-400' : ''}>
                      {isFullMatch ? '2/2' : '1/2'}
                    </span>

                    {match.total_units && (
                      <span className="ml-3">
                        <span className="text-amber-400">Unidades: </span>
                        <span className="text-green-400">
                          {match.total_units}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  {/* Botón de eliminar (solo visible para el creador) */}
                  {isPlayer1 && (
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      disabled={deletingMatchId === match.id}
                      className="px-3 py-2 rounded imperial-button bg-red-600 hover:bg-red-700 text-white flex items-center"
                      title="Eliminar partida"
                    >
                      {deletingMatchId === match.id ? (
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                          <span className="ml-1">Borrar</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Botón principal para unirse/entrar */}
                  <button
                    onClick={() => handleEnterMatch(match)}
                    disabled={
                      joiningMatchId === match.id ||
                      joiningMatch ||
                      (!isPlayer1 && !isPlayer2 && isFullMatch)
                    }
                    className={`px-4 py-2 rounded imperial-button
                      ${
                        joiningMatchId === match.id
                          ? 'bg-amber-700 text-amber-100 cursor-wait'
                          : isPlayer1 || isPlayer2
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : canJoin
                              ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                  >
                    {joiningMatchId === match.id
                      ? 'Uniéndose...'
                      : isPlayer1
                        ? 'Tu Partida'
                        : isPlayer2
                          ? 'Continuar Partida'
                          : isFullMatch
                            ? 'Partida Llena'
                            : 'Unirse a Batalla'}
                  </button>
                </div>
              </div>
            )
          })}
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
