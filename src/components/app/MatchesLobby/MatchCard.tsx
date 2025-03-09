// MatchCard.tsx
import React from 'react'
import { Match } from '../../../types'
import { LoadingButton, SwordIcon, TrashIcon } from './UIComponents'

interface MatchCardProps {
  match: Match
  currentPlayerId: string | undefined
  isAuthenticated: boolean
  joiningMatchId: string | null
  joiningMatch: boolean
  deletingMatchId: string | null
  onEnterMatch: (match: Match) => void
  onDeleteMatch: (matchId: string) => void
}

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getButtonText = () => {
    if (joiningMatchId === match.id) return 'Uniéndose...'
    if (isPlayer1) return 'Tu Partida'
    if (isPlayer2) return 'Continuar Partida'
    if (isFullMatch) return 'Partida Llena'
    return 'Unirse a Batalla'
  }

  const getButtonClass = () => {
    if (joiningMatchId === match.id)
      return 'bg-amber-700 text-amber-100 cursor-wait'
    if (isPlayer1 || isPlayer2)
      return 'bg-primary hover:bg-primary/90 text-primary-foreground'
    if (canJoin)
      return 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
    return 'bg-muted text-muted-foreground cursor-not-allowed'
  }

  return (
    <div
      className={`war-zone-card p-6 rounded transition-all duration-200 ${
        isPlayer1 || isPlayer2 ? 'border-l-4 border-amber-500' : ''
      }`}
    >
      <div>
        <h3 className="text-2xl font-bold flex items-center">
          <span className="icon-sword mr-2">
            <SwordIcon />
          </span>
          {match.match_title || 'Zona de Guerra'}
          {(isPlayer1 || isPlayer2) && (
            <span className="ml-2 text-sm bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">
              {isPlayer1 ? 'Tu Campaña' : 'Participando'}
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Desplegada: {formatDate(match.created_at)}
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
              <span className="text-green-400">{match.total_units}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        {/* Botón de eliminar (solo visible para el creador) */}
        {isPlayer1 && (
          <LoadingButton
            onClick={() => onDeleteMatch(match.id)}
            isLoading={deletingMatchId === match.id}
            loadingText=""
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white"
            title="Eliminar partida"
            icon={<TrashIcon />}
          >
            <span className="ml-1">Borrar</span>
          </LoadingButton>
        )}

        {/* Botón principal para unirse/entrar */}
        <button
          onClick={() => onEnterMatch(match)}
          disabled={
            joiningMatchId === match.id ||
            joiningMatch ||
            (!isPlayer1 && !isPlayer2 && isFullMatch)
          }
          className={`px-4 py-2 rounded imperial-button ${getButtonClass()}`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}

export default MatchCard
