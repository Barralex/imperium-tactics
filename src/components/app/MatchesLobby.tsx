import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { gql } from '@apollo/client'
import CreateMatchModal from './CreateMatchModal'
import { GET_WAITING_MATCHES, CREATE_MATCH } from '../../graphql/matches'

// Definir la mutación para unirse a una partida
const JOIN_MATCH = gql`
  mutation JoinMatch($matchId: uuid!, $player2_id: uuid!) {
    update_matches_by_pk(
      pk_columns: { id: $matchId }
      _set: { player2_id: $player2_id }
    ) {
      id
      status
      player1_id
      player2_id
    }
  }
`

interface Match {
  id: string
  status: string
  created_at: string
  player1_id: string
  player2_id: string | null
}

const MatchesLobby: React.FC = () => {
  const { isAuthenticated, user } = useAuth0()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null)

  // Consulta para obtener salas en espera
  const { loading, error, data, refetch } = useQuery(GET_WAITING_MATCHES, {
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

  // Manejar la creación de una nueva sala
  const handleCreateMatch = () => {
    if (!isAuthenticated || !user) return

    // Extraer el UUID real del usuario desde los claims de Hasura
    const playerId =
      user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

    if (!playerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    createMatch({
      variables: {
        player1_id: playerId,
      },
    })
  }

  // Manejar la entrada a una partida
  const handleEnterMatch = (match: Match) => {
    if (!isAuthenticated || !user) {
      // Si no está autenticado, podría redirigir a login
      return
    }

    // Obtener el ID del jugador actual
    const currentPlayerId =
      user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

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
      console.log('👤 Intentando unirse como jugador 2...')
      setJoiningMatchId(match.id)

      joinMatch({
        variables: {
          matchId: match.id,
          player2_id: currentPlayerId,
        },
      })
    } else if (match.player2_id === currentPlayerId) {
      // Si ya es el jugador 2, simplemente redirigir
      console.log('🔄 Redirigiendo al jugador 2 a su partida')
      navigate(`/match/${match.id}`)
    } else {
      // Si la partida ya tiene dos jugadores y ninguno es el usuario actual
      console.error(
        '❌ Esta partida ya tiene dos jugadores y no eres uno de ellos'
      )
      // Aquí podrías mostrar un mensaje de error o simplemente no hacer nada
    }
  }

  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="battlefields-section mb-8">
          <div className="h-8 bg-muted/30 w-64 mx-auto rounded animate-pulse"></div>
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
      {/* Título de sección */}
      <div className="battlefields-section mb-8">
        <h2 className="battlefields-title">Campos de Batalla</h2>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">
            No hay zonas de guerra activas. La galaxia aguarda a que comandes
            tus fuerzas.
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded imperial-button"
            >
              Iniciar Nueva Campaña
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: Match) => (
            <div key={match.id} className="war-zone-card p-6 rounded">
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
                  Zona de Guerra
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

                {/* Mostrar información sobre los jugadores */}
                <div className="mt-2 text-sm">
                  <span className="text-amber-400">Jugadores: </span>
                  <span>{match.player2_id ? '2/2' : '1/2'}</span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleEnterMatch(match)}
                  disabled={joiningMatchId === match.id || joiningMatch}
                  className={`px-4 py-2 rounded imperial-button
                    ${
                      joiningMatchId === match.id
                        ? 'bg-amber-700 text-amber-100 cursor-wait'
                        : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                    }`}
                >
                  {joiningMatchId === match.id
                    ? 'Uniéndose...'
                    : match.player1_id ===
                        user?.['https://hasura.io/jwt/claims']?.[
                          'x-hasura-user-id'
                        ]
                      ? 'Tu Partida'
                      : match.player2_id
                        ? match.player2_id ===
                          user?.['https://hasura.io/jwt/claims']?.[
                            'x-hasura-user-id'
                          ]
                          ? 'Continuar Partida'
                          : 'Partida Llena'
                        : 'Unirse a Batalla'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear una nueva sala */}
      {isModalOpen && (
        <CreateMatchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateMatch}
          isLoading={creatingMatch}
        />
      )}
    </div>
  )
}

export default MatchesLobby
