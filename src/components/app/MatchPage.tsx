import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/client'
import {
  GET_MATCH_SUBSCRIPTION,
  UPDATE_MATCH,
  LEAVE_MATCH,
} from '../../graphql/matches'
import BattleBoard from './BattleBoard'

interface Match {
  id: string
  status: string
  player: { id: string; email: string; avatar: string }
  playerByPlayer2Id?: { id: string; email: string; avatar: string } | null
}

const MatchPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const [connectedPlayers, setConnectedPlayers] = useState<Match | null>(null)

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

  // Función para que el jugador 2 abandone la partida
  const [leaveMatch, { loading: leavingMatch }] = useMutation(LEAVE_MATCH)

  const handleLeaveMatch = () => {
    leaveMatch({
      variables: {
        matchId: matchId,
      },
      onCompleted: (data) => {
        console.log('Has abandonado la partida con éxito:', data)
        // Opcional: redirigir al usuario a la página principal
        // history.push('/');
      },
      onError: (error) => {
        console.error('Error al abandonar la partida:', error)
        // Aquí podrías mostrar un mensaje de error al usuario
      },
    })
  }

  // Función para iniciar la batalla
  const [updateMatch, { loading: updatingMatch }] = useMutation(UPDATE_MATCH)

  const handleStartBattle = () => {
    if (!connectedPlayers || !connectedPlayers.playerByPlayer2Id) return

    console.log('Iniciando batalla...') // Para depuración

    // Elegir aleatoriamente quién comienza (50/50)
    const randomPlayer =
      Math.random() < 0.5
        ? connectedPlayers.player.id
        : connectedPlayers.playerByPlayer2Id.id

    // Actualizar el estado de la partida a "in_progress" y asignar el turno
    // Usando exactamente el formato de la mutación que ya probaste
    updateMatch({
      variables: {
        matchId: matchId,
        set: {
          // Note que aquí usamos "set" para coincidir con "_set" en GraphQL
          status: 'in_progress', // Asegurando que usamos "in_progress" sin asteriscos
          turn: randomPlayer,
        },
      },
      onCompleted: (data) => {
        console.log('Batalla iniciada con éxito:', data)
      },
      onError: (error) => {
        console.error('Error al iniciar la batalla:', error)
        alert('Error al iniciar la batalla. Por favor intenta de nuevo.') // Feedback visual
      },
    })
  }

  if (loading)
    return <p className="text-center text-white">Cargando partida...</p>
  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>

  return (
    <div className="text-white max-w-6xl mx-auto px-4 py-6 relative">
      {/* Cabecera con título y estado */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">Partida {matchId}</h2>
        {connectedPlayers && (
          <p className="mt-2 text-gray-300">
            Estado: {connectedPlayers.status}
          </p>
        )}
      </div>

      {/* Layout principal con dos columnas */}
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        {/* Panel lateral de jugadores - Ahora integrado en la vista principal */}
        <div className="lg:w-1/4 bg-gray-900/80 rounded-lg border border-gray-800 p-4">
          <h3 className="text-xl font-bold mb-4 text-amber-400 border-b border-gray-700 pb-2">
            Jugadores en batalla
          </h3>

          {connectedPlayers ? (
            <ul className="space-y-4">
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
                      {' '}
                      {/* Añadimos padding a la derecha para el botón */}
                      <span className="block truncate">
                        {connectedPlayers.playerByPlayer2Id.email}
                      </span>
                      <span className="text-blue-400 text-sm">(Jugador 2)</span>
                    </div>
                  </div>

                  {/* Ícono de abandonar para el jugador 2 - Ahora posicionado absolutamente */}
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
                  Recursos: 100
                </p>
              </div>

              <button className="bg-gray-800 hover:bg-gray-700 text-gray-200 w-full px-4 py-2 rounded border border-gray-700">
                Desplegar unidad
              </button>

              <button className="bg-amber-700 hover:bg-amber-600 text-amber-100 w-full px-4 py-2 rounded border border-amber-900">
                Terminar turno
              </button>
            </div>
          )}
        </div>

        {/* Tablero de batalla - ahora ocupa menos espacio */}
        <div className="lg:w-3/4">
          <div className="bg-black/30 p-4 rounded-lg border border-gray-800 h-full flex flex-col">
            {connectedPlayers?.status === 'in_progress' ? (
              // Tablero de juego activo
              <div className="flex justify-center flex-1">
                <BattleBoard />
              </div>
            ) : (
              // Tablero en espera
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="opacity-50 mb-4">
                  <BattleBoard />
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  El campo de batalla se activará cuando comience la partida
                </p>

                {!connectedPlayers?.playerByPlayer2Id && (
                  <p className="text-amber-300 text-lg mt-4">
                    Esperando a un oponente...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchPage
