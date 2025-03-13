// src/components/app/Match/CombatSystem/AttackControls.tsx
import React from 'react'
import { useGameplayStore } from '@/stores'

interface AttackControlsProps {
  currentPlayerId?: string
  isPlayerTurn: boolean
}

const AttackControls: React.FC<AttackControlsProps> = ({
  currentPlayerId,
  isPlayerTurn,
}) => {
  const {
    attackingPiece,
    targetedPiece,
    attackResult,
    setAttackingPiece,
    setTargetedPiece,
    performAttack,
    clearAttackResult,
    pieces,
  } = useGameplayStore()

  // Obtener piezas vivas del jugador actual
  const playerPieces = pieces.filter(
    (p) => p.player_id === currentPlayerId && p.is_alive !== false && p.hp > 0
  );
  

  // Obtener piezas vivas del enemigo
  const enemyPieces = pieces.filter(
    (p) => p.player_id !== currentPlayerId && p.is_alive !== false && p.hp > 0
  );

  const handleAttackClick = () => {
    performAttack()
  }

  const handleCancelClick = () => {
    setAttackingPiece(null)
    setTargetedPiece(null)
    clearAttackResult()
  }

  if (!isPlayerTurn) return null

  return (
    <div className="mt-4 p-4 border border-amber-900/50 rounded-md bg-gray-900/70">
      <h3 className="text-lg font-bold text-amber-500 mb-3">
        Sistema de Combate
      </h3>

      {attackResult && (
        <div
          className={`mb-3 p-2 rounded-md ${attackResult.success ? 'bg-green-900/40 border border-green-700' : 'bg-red-900/40 border border-red-700'}`}
        >
          <p
            className={attackResult.success ? 'text-green-400' : 'text-red-400'}
          >
            {attackResult.message}
          </p>
          <button
            onClick={clearAttackResult}
            className="text-xs underline mt-1 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-amber-400 text-sm mb-1">Atacante</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
            value={attackingPiece?.id || ''}
            onChange={(e) => {
              const piece = playerPieces.find((p) => p.id === e.target.value)
              setAttackingPiece(piece || null)
            }}
          >
            <option value="">Selecciona una unidad</option>
            {playerPieces.map((piece) => (
              <option key={piece.id} value={piece.id}>
                {piece.type.toUpperCase()} - HP: {piece.hp} - Rango:{' '}
                {piece.range}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-amber-400 text-sm mb-1">Objetivo</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2"
            value={targetedPiece?.id || ''}
            onChange={(e) => {
              const piece = enemyPieces.find((p) => p.id === e.target.value)
              setTargetedPiece(piece || null)
            }}
            disabled={!attackingPiece}
          >
            <option value="">Selecciona un objetivo</option>
            {enemyPieces.map((piece) => {
              const canBeAttacked = attackingPiece
                ? useGameplayStore.getState().canAttack(attackingPiece, piece)
                : false

              return (
                <option
                  key={piece.id}
                  value={piece.id}
                  disabled={!canBeAttacked}
                >
                  {piece.type.toUpperCase()} - HP: {piece.hp}{' '}
                  {!canBeAttacked ? '(Fuera de rango)' : ''}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={handleCancelClick}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-md"
        >
          Cancelar
        </button>
        <button
          onClick={handleAttackClick}
          disabled={!attackingPiece || !targetedPiece}
          className={`px-3 py-1 rounded-md ${
            attackingPiece && targetedPiece
              ? 'bg-red-700 hover:bg-red-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Atacar
        </button>
      </div>
    </div>
  )
}

export default AttackControls
