import React from 'react'
import { MatchDetails } from '../../../types'
import { LoadingButton } from '../MatchesLobby/UIComponents'
import { Sword } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
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
)

interface HeaderProps {
  title: string
  status?: string
}

export const Header: React.FC<HeaderProps> = ({ title, status }) => {
  const getStatusLabel = (status: string | undefined) => {
    if (!status) return ''

    switch (status) {
      case 'waiting':
        return 'Esperando a que comience la partida'
      case 'deployment':
        return 'Fase de despliegue - Posiciona tus unidades'
      case 'in_progress':
        return 'Batalla en progreso'
      case 'finished':
        return 'Batalla finalizada'
      default:
        return `Estado: ${status}`
    }
  }

  return (
    <div className="text-center py-2 bg-gradient-to-b from-gray-900 to-gray-800 border-b border-amber-600">
      <h2 className="text-2xl font-bold text-amber-500 tracking-wider">
        {title}
      </h2>

      {status && (
        <p className="text-sm text-gray-300 mt-1">{getStatusLabel(status)}</p>
      )}
    </div>
  )
}

interface PlayerItemProps {
  player: {
    email: string
    avatar: string
  }
  isHost: boolean
  onLeave?: () => void
  isLeaving?: boolean
}

export const PlayerItem: React.FC<PlayerItemProps> = ({
  player,
  isHost,
  onLeave,
  isLeaving,
}) => (
  <li className="p-2 rounded bg-gray-800/50 relative">
    <div className="flex items-center space-x-3">
      <img
        src={player.avatar}
        alt={player.email}
        className={`w-10 h-10 rounded-full border-2 ${isHost ? 'border-green-600' : 'border-blue-600'}`}
      />
      <div className="flex-1 pr-8">
        <span className="block truncate">{player.email}</span>
        <span
          className={`${isHost ? 'text-green-400' : 'text-blue-400'} text-sm`}
        >
          {isHost ? '(Host)' : '(Jugador 2)'}
        </span>
      </div>
    </div>

    {onLeave && (
      <button
        onClick={onLeave}
        disabled={isLeaving}
        className={`text-red-600 hover:text-red-400 transition-colors focus:outline-none absolute top-2 right-2 ${isLeaving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    )}
  </li>
)

interface PlayersListProps {
  connectedPlayers: MatchDetails | null
  onLeaveMatch: () => void
  leavingMatch: boolean
}

export const PlayersList: React.FC<PlayersListProps> = ({
  connectedPlayers,
  onLeaveMatch,
  leavingMatch,
}) => (
  <div>
    <h3 className="text-xl font-bold mb-3 text-amber-400 border-b border-gray-700 pb-2 text-center">
      Jugadores en batalla
    </h3>

    {connectedPlayers ? (
      <ul className="space-y-3">
        <PlayerItem player={connectedPlayers.player} isHost={true} />

        {connectedPlayers.playerByPlayer2Id ? (
          <PlayerItem
            player={connectedPlayers.playerByPlayer2Id}
            isHost={false}
            onLeave={onLeaveMatch}
            isLeaving={leavingMatch}
          />
        ) : (
          <p className="text-gray-400 text-center py-4 italic">
            Esperando a un oponente...
          </p>
        )}
      </ul>
    ) : (
      <p className="text-gray-400">No hay jugadores conectados.</p>
    )}
  </div>
)

interface BattleCommandsProps {
  status: string | undefined
  hasOpponent: boolean
  totalUnits: number | undefined
  onStartBattle: () => void
  onDeployUnit: () => void
  onEndTurn?: () => void
  isHost: boolean
  loading: boolean
}

export const BattleCommands: React.FC<BattleCommandsProps> = ({
  status,
  hasOpponent,
  totalUnits,
  onStartBattle,
  onDeployUnit,
  onEndTurn,
  isHost,
  loading,
}) => {
  const renderCommandsByStatus = () => {
    switch (status) {
      case 'waiting':
        if (hasOpponent && isHost) {
          return (
            <div className="mt-6 text-center">
              <LoadingButton
                onClick={onStartBattle}
                isLoading={loading}
                className="bg-amber-600 hover:bg-amber-500 text-black w-full px-4 py-3 rounded-md font-bold transition"
                loadingText="Iniciando batalla..."
                icon={<Sword className="w-5 h-5" />}
              >
                Comenzar Batalla
              </LoadingButton>
            </div>
          )
        } else if (hasOpponent && !isHost) {
          return (
            <div className="mt-6 text-center">
              <div className="bg-gray-800/70 border border-amber-900/50 rounded-lg p-4">
                <div className="flex justify-center mb-2 text-2xl">
                  <span className="animate-bounce mr-2">🐉</span>
                  <span className="animate-bounce delay-100">🔥</span>
                </div>
                <p className="text-amber-400 font-bold mb-1">
                  Preparando batalla...
                </p>
                <p className="text-gray-300 text-sm">
                  Esperando a que el anfitrión inicie el combate
                </p>
              </div>
            </div>
          )
        }
        return null

      case 'deployment':
        return (
          <div className="mt-6 space-y-3">
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <p className="text-amber-400 font-semibold">Fase de Despliegue</p>
              <p className="text-amber-400 font-semibold mt-2">
                Unidades: {totalUnits}
              </p>
            </div>

            <button
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 w-full px-4 py-2 rounded border border-gray-700"
              onClick={onDeployUnit}
            >
              Desplegar unidad
            </button>

            <button
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 w-full px-4 py-2 rounded border border-amber-900"
              onClick={onEndTurn}
            >
              Finalizar Despliegue
            </button>
          </div>
        )

      case 'in_progress':
        return (
          <div className="mt-6 space-y-3">
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <p className="text-amber-400 font-semibold">Turno: 1</p>
              <p className="text-amber-400 font-semibold mt-2">
                Unidades: {totalUnits}
              </p>
            </div>

            <button
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 w-full px-4 py-2 rounded border border-amber-900"
              onClick={onEndTurn}
            >
              Terminar turno
            </button>
          </div>
        )

      case 'finished':
        return (
          <div className="mt-6 space-y-3">
            <div className="bg-gray-800 p-3 rounded border border-gray-700 text-center">
              <p className="text-amber-400 font-semibold">
                ¡Batalla Finalizada!
              </p>
              <div className="flex justify-center mt-2">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <button
              className="bg-amber-700 hover:bg-amber-600 text-amber-100 w-full px-4 py-2 rounded border border-amber-900"
              onClick={() => window.location.reload()} // Simplemente recargar para volver al inicio
            >
              Volver al Lobby
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return <div>{renderCommandsByStatus()}</div>
}

interface BattleAreaProps {
  status?: string
  isActive?: boolean
  children: React.ReactNode
}

export const BattleArea: React.FC<BattleAreaProps> = ({
  status = 'waiting',
  isActive = false,
  children,
}) => {
  const isAreaActive =
    isActive ||
    status === 'deployment' ||
    status === 'in_progress' ||
    status === 'finished'

  const getStatusMessage = () => {
    switch (status) {
      case 'waiting':
        return 'El campo de batalla se activará cuando comience la partida'
      case 'deployment':
        return 'Fase de despliegue - Posiciona tus unidades estratégicamente'
      case 'in_progress':
        return '¡Batalla en progreso!'
      case 'finished':
        return 'La batalla ha terminado'
      default:
        return 'Esperando...'
    }
  }

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-gray-800 h-full flex flex-col">
      {isAreaActive ? (
        <div className="flex justify-center flex-1 relative">
          {children}
          {status === 'finished' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-2xl font-bold text-amber-500 mb-2">
                  ¡Victoria!
                </h3>
                <p className="text-gray-300">La batalla ha terminado</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center flex-1 flex flex-col items-center justify-center">
          <div className="opacity-50 mb-4">{children}</div>
          <p className="text-gray-400 mt-4 text-sm">{getStatusMessage()}</p>
        </div>
      )}
    </div>
  )
}
