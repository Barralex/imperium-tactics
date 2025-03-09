import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/client'
import {
  GET_MATCH_SUBSCRIPTION,
  UPDATE_MATCH,
  LEAVE_MATCH,
} from '../../graphql/matches'
import BattleBoard from './BattleBoard'
import LoadingScreen from './LoadingScreen'
import UnitSelectionModal from './UnitSelectionModal' // Importar el nuevo componente
import { useAuth0 } from '@auth0/auth0-react'

interface Match {
  id: string
  status: string
  match_title: string
  player: { id: string; email: string; avatar: string }
  playerByPlayer2Id?: { id: string; email: string; avatar: string } | null
  total_units: number
}

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [connectedPlayers, setConnectedPlayers] = useState<Match | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // Estado para controlar el modal
  const { user } = useAuth0()

  // Suscribirse a cambios en la partida
  const { data, loading, error } = useSubscription(GET_MATCH_SUBSCRIPTION, {
    variables: { matchId },
  })

  useEffect(() => {
    console.log('📡 Suscripción recibida:', data)
    if (data) {
      setConnectedPlayers(data.matches_by_pk)
    }
  }, [data])

  // Mutaciones para la gestión de partidas
  const [leaveMatch, { loading: leavingMatch }] = useMutation(LEAVE_MATCH)
  const [updateMatch, { loading: updatingMatch }] = useMutation(UPDATE_MATCH)

  const handleLeaveMatch = () => {
    leaveMatch({
      variables: { matchId },
      onCompleted: (data) => {
        console.log('Has abandonado la partida con éxito:', data)
        navigate('/')
      },
      onError: (error) => {
        console.error('Error al abandonar la partida:', error)
      },
    })
  }

  const handleStartBattle = () => {
    if (!connectedPlayers || !connectedPlayers.playerByPlayer2Id) return

    console.log('Iniciando batalla...')
    const randomPlayer =
      Math.random() < 0.5
        ? connectedPlayers.player.id
        : connectedPlayers.playerByPlayer2Id.id

    updateMatch({
      variables: {
        matchId,
        set: {
          status: 'in_progress',
          turn: randomPlayer,
        },
      },
      onCompleted: (data) => {
        console.log('Batalla iniciada con éxito:', data)
      },
      onError: (error) => {
        console.error('Error al iniciar la batalla:', error)
        alert('Error al iniciar la batalla. Por favor intenta de nuevo.')
      },
    })
  }

  const handleBackToLobby = () => {
    navigate('/')
  }

  // Función para abrir el modal de selección de unidades
  const handleDeployUnit = () => {
    setIsModalOpen(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const currentPlayerId =
    user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  if (loading) return <LoadingScreen />

  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>

  return (
    <div className="text-white h-screen overflow-hidden">
      {/* Modal de selección de unidades con límite máximo */}
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxUnidades={5}
        playerId={currentPlayerId}
        matchId={matchId}
        connectedPlayers={connectedPlayers}
      />

      {/* Botón para volver al lobby - simple círculo */}
      <button
        onClick={handleBackToLobby}
        title="Volver al Lobby"
        className="absolute top-4 left-4 z-10 text-amber-400 hover:text-amber-300 bg-gray-900/60 p-1.5 rounded-full border border-amber-900/30 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Cabecera con título y estado */}
      <div className="text-center pt-4 pb-2">
        <h2 className="text-3xl font-bold">
          {connectedPlayers?.match_title || `Partida ${matchId}`}
        </h2>
        {connectedPlayers && (
          <p className="mt-1 text-gray-300">
            Estado: {connectedPlayers.status}
          </p>
        )}
      </div>

      {/* Layout principal con dos columnas - panel de jugadores 30% más ancho */}
      <div className="max-w-5xl mx-auto px-4 mt-4 flex flex-col lg:flex-row gap-4">
        {/* Panel lateral de jugadores - AUMENTADO 30% DE ANCHO */}
        <div className="lg:w-1/3 bg-gray-900/80 rounded-lg border border-gray-800 p-4">
          <h3 className="text-xl font-bold mb-3 text-amber-400 border-b border-gray-700 pb-2 text-center">
            Jugadores en batalla
          </h3>

          {connectedPlayers ? (
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 p-2 rounded bg-gray-800/50">
                <img
                  src={connectedPlayers.player.avatar}
                  alt={connectedPlayers.player.email}
                  className="w-10 h-10 rounded-full border-2 border-green-600"
                />
                <div className="flex-1">
                  <span className="block truncate">
                    {connectedPlayers.player.email}
                  </span>
                  <span className="text-green-400 text-sm">(Host)</span>
                </div>
              </li>

              {connectedPlayers.playerByPlayer2Id ? (
                <li className="p-2 rounded bg-gray-800/50 relative">
                  <div className="flex items-center space-x-3">
                    <img
                      src={connectedPlayers.playerByPlayer2Id.avatar}
                      alt={connectedPlayers.playerByPlayer2Id.email}
                      className="w-10 h-10 rounded-full border-2 border-blue-600"
                    />
                    <div className="flex-1 pr-8">
                      <span className="block truncate">
                        {connectedPlayers.playerByPlayer2Id.email}
                      </span>
                      <span className="text-blue-400 text-sm">(Jugador 2)</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLeaveMatch}
                    disabled={leavingMatch}
                    className={`text-red-600 hover:text-red-400 transition-colors focus:outline-none absolute top-2 right-2 ${leavingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Abandonar partida"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </li>
              ) : (
                <p className="text-gray-400 text-center py-4 italic">
                  Esperando a un oponente...
                </p>
              )}
            </ul>
          ) : (
            <p className="text-gray-400">No hay jugadores conectados.</p>
          )}

          {/* Comandos de batalla */}
          {connectedPlayers?.status === 'waiting' &&
            connectedPlayers?.playerByPlayer2Id && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleStartBattle}
                  className="bg-amber-600 hover:bg-amber-500 text-black w-full px-4 py-3 rounded-md font-bold transition"
                >
                  Comenzar Batalla
                </button>
              </div>
            )}

          {connectedPlayers?.status === 'in_progress' && (
            <div className="mt-6 space-y-3">
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <p className="text-amber-400 font-semibold">Turno: 1</p>
                <p className="text-amber-400 font-semibold mt-2">
                  Unidades: {connectedPlayers.total_units}
                </p>
              </div>

              <button
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 w-full px-4 py-2 rounded border border-gray-700"
                onClick={handleDeployUnit} // Agregar el controlador de eventos aquí
              >
                Desplegar unidad
              </button>

              <button className="bg-amber-700 hover:bg-amber-600 text-amber-100 w-full px-4 py-2 rounded border border-amber-900">
                Terminar turno
              </button>
            </div>
          )}
        </div>

        {/* Tablero de batalla - ajustado para compensar panel más ancho */}
        <div className="lg:w-2/3">
          <div className="bg-black/30 p-4 rounded-lg border border-gray-800 h-full flex flex-col">
            {connectedPlayers?.status === 'in_progress' ? (
              <div className="flex justify-center flex-1">
                <BattleBoard />
              </div>
            ) : (
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="opacity-50 mb-4">
                  <BattleBoard />
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  El campo de batalla se activará cuando comience la partida
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchPage
