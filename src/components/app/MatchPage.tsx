import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/client'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { GET_MATCH_SUBSCRIPTION } from '../../graphql/matches'
import BattleBoard from './BattleBoard' // Importar el componente BattleBoard

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
    console.log('📡 Suscripción recibida:', data) // 🔥 Log para depuración

    if (data) {
      setConnectedPlayers(data.matches_by_pk)
    }
  }, [data])

  if (loading)
    return <p className="text-center text-white">Cargando partida...</p>
  if (error)
    return <p className="text-center text-red-500">Error: {error.message}</p>

  return (
    <div className="text-white text-center max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold">Partida {matchId}</h2>
      {connectedPlayers && (
        <p className="mt-2 text-gray-300">Estado: {connectedPlayers.status}</p>
      )}

      {/* Información del juego y tablero */}
      <div className="mt-8 mb-8">
        {connectedPlayers?.status === 'in_progress' ? (
          // Si la partida está en progreso, mostrar tablero completo
          <div>
            <div className="flex justify-between items-center mb-4 px-4">
              <div className="text-left">
                <p className="text-amber-400 font-semibold">Turno: 1</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-semibold">Recursos: 100</p>
              </div>
            </div>
            <div className="flex justify-center overflow-auto">
              <BattleBoard />
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded border border-gray-700">
                Desplegar unidad
              </button>
              <button className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-4 py-2 rounded border border-amber-900">
                Terminar turno
              </button>
            </div>
          </div>
        ) : (
          // Si está en espera, mostrar mensaje y tablero más pequeño
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <div className="text-center mb-6">
              {!connectedPlayers?.playerByPlayer2Id ? (
                <p className="text-amber-300 text-lg mb-4">
                  Esperando a un oponente...
                </p>
              ) : (
                <button className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-3 rounded-md font-bold transition">
                  Comenzar Batalla
                </button>
              )}
            </div>

            <div className="flex justify-center opacity-50">
              <BattleBoard />
            </div>

            <p className="text-gray-400 mt-4 text-sm">
              El campo de batalla se activará cuando comience la partida
            </p>
          </div>
        )}
      </div>

      {/* Botón para abrir la lista de jugadores */}
      <Sheet>
        <SheetTrigger className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-bold mt-4">
          Ver jugadores
        </SheetTrigger>
        <SheetContent className="bg-gray-900 text-white p-4">
          <h3 className="text-xl font-bold mb-4">Jugadores en la partida</h3>

          {connectedPlayers ? (
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <img
                  src={connectedPlayers.player.avatar}
                  alt={connectedPlayers.player.email}
                  className="w-10 h-10 rounded-full border border-yellow-400"
                />
                <span>{connectedPlayers.player.email}</span>
                <span className="text-green-400">(Host)</span>
              </li>

              {connectedPlayers.playerByPlayer2Id ? (
                <li className="flex items-center space-x-3">
                  <img
                    src={connectedPlayers.playerByPlayer2Id.avatar}
                    alt={connectedPlayers.playerByPlayer2Id.email}
                    className="w-10 h-10 rounded-full border border-yellow-400"
                  />
                  <span>{connectedPlayers.playerByPlayer2Id.email}</span>
                  <span className="text-blue-400">(Jugador 2)</span>
                </li>
              ) : (
                <p className="text-gray-400">Esperando a un oponente...</p>
              )}
            </ul>
          ) : (
            <p className="text-gray-400">No hay jugadores conectados.</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MatchPage
