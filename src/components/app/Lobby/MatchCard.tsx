import React from 'react'
import { Match } from '@/types'
import { Trash2, Sword } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from './ActionButtons'

interface MatchCardProps {
  match: Match
  currentPlayerId?: string
  isAuthenticated: boolean
  joiningMatchId: string | null
  joiningMatch: boolean
  deletingMatchId: string | null
  onEnterMatch: (match: Match) => void
  onDeleteMatch: (matchId: string) => void
}

/**
 * Componente que muestra la información de una partida
 */
const MatchCard: React.FC<MatchCardProps> = ({
  match,
  currentPlayerId,
  isAuthenticated,
  joiningMatchId,
  joiningMatch,
  deletingMatchId,
  onEnterMatch,
  onDeleteMatch,
}) => {
  const isPlayer1 = match.player1_id === currentPlayerId
  const isPlayer2 = match.player2_id === currentPlayerId
  const isFullMatch = match.player2_id !== null
  const canJoin = isAuthenticated && !isFullMatch && !isPlayer1
  const isJoining = joiningMatchId === match.id
  const isDeleting = deletingMatchId === match.id

  const getButtonText = () => {
    if (isJoining) return 'Uniéndose...'
    if (isPlayer1) return 'Entrar'
    if (isPlayer2) return 'Continuar'
    if (isFullMatch) return 'Llena'
    return 'Unirse'
  }

  const getButtonClass = () => {
    if (isJoining) return 'bg-amber-700 text-amber-100 cursor-wait'
    if (isPlayer1 || isPlayer2) return 'bg-amber-600 hover:bg-amber-500 text-black'
    if (canJoin) return 'bg-green-700 hover:bg-green-600 text-white'
    return 'bg-gray-700 text-gray-300 cursor-not-allowed'
  }

  return (
    <div
      className={cn(
        "war-zone-card bg-black/40 border border-amber-900/40 rounded-md transition-all duration-200 overflow-hidden",
        (isPlayer1 || isPlayer2) && "border-l-4 border-amber-500"
      )}
    >
      <div className="p-3 flex flex-col h-full">
        {/* Cabecera con título y estado */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold flex items-center text-amber-400">
            <Sword width={16} height={16} color="#fbbf24" className="mr-1" />
            <span className="truncate">
              {match.match_title || 'Zona de Guerra'}
            </span>
          </h3>
          {(isPlayer1 || isPlayer2) && (
            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full whitespace-nowrap">
              {isPlayer1 ? 'Tu Batalla' : 'Participando'}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 text-sm flex-grow">
          <p className="text-gray-400 flex items-center">
            <span className="w-3 h-3 rounded-full mr-1.5 inline-block bg-amber-700"></span>
            Desplegada: {formatDate(match.created_at)}
          </p>

          <div className="flex space-x-3">
            <p className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-1.5 inline-block bg-amber-700"></span>
              <span className="text-gray-400">Unidades: </span>
              <span className="text-amber-400 ml-1">
                {match.total_units || 0}
              </span>
            </p>

            <p className="flex items-center">
              <span className="w-3 h-3 rounded-full mr-1.5 inline-block bg-amber-700"></span>
              <span className="text-gray-400">Jugadores: </span>
              <span className={cn(
                "ml-1", 
                isFullMatch ? "text-green-500" : "text-amber-400"
              )}>
                {isFullMatch ? '2/2' : '1/2'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-3 space-x-2">
          {isPlayer1 && (
            <Button
            onClick={() => onDeleteMatch(match.id)}
            disabled={isDeleting}
            className="px-2 py-1 bg-red-900 hover:bg-red-800 text-white rounded-sm text-xs flex items-center gap-1"
            title="Eliminar"
            isLoading={isDeleting}
            loadingText="Eliminando..."
            icon={<Trash2 width={14} height={14} />}
            >
              Eliminar
            </Button>
          )}

          <button
            onClick={() => onEnterMatch(match)}
            disabled={isJoining || joiningMatch || (!isPlayer1 && !isPlayer2 && isFullMatch)}
            className={cn(
              "px-3 py-1 rounded-sm text-sm font-bold imperial-button",
              getButtonClass()
            )}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MatchCard