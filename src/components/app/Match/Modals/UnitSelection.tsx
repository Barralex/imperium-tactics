import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { INSERT_PIECES } from '@/graphql/matches'
import { UnitSelectionProps, UnitType } from '@/types'
import {
  generateDeployPositions,
  getUnitIcon,
  UNIT_CONFIGS,
} from '@/types/unit'

const UnitSelection = ({
  isOpen,
  onClose,
  maxUnits = 5,
  playerId,
  matchId,
  playerId1,
}: UnitSelectionProps) => {
  const [unitCounts, setUnitCounts] = useState<Record<UnitType, number>>({
    melee: 0,
    ranged: 0,
    normal: 0,
  })

  const [insertPieces, { loading: insertingPieces }] =
    useMutation(INSERT_PIECES)

  const totalUnits = Object.values(unitCounts).reduce(
    (sum, count) => sum + count,
    0
  )
  const isDeploymentReady = totalUnits === maxUnits

  useEffect(() => {
    if (isOpen) {
      setUnitCounts({
        melee: 0,
        ranged: 0,
        normal: 0,
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddUnit = (unitType: UnitType) => {
    if (totalUnits < maxUnits) {
      setUnitCounts((prev) => ({
        ...prev,
        [unitType]: prev[unitType] + 1,
      }))
    } else {
      alert(
        `¡Imposible desplegar más! Límite de ${maxUnits} unidades alcanzado.`
      )
    }
  }

  const handleRemoveUnit = (unitType: UnitType) => {
    if (unitCounts[unitType] > 0) {
      setUnitCounts((prev) => ({
        ...prev,
        [unitType]: prev[unitType] - 1,
      }))
    }
  }

  const handleDeploy = async () => {
    if (totalUnits !== maxUnits) {
      alert(
        `¡Debes seleccionar exactamente ${maxUnits} unidades para desplegar!`
      )
      return
    }

    if (!playerId || !matchId) {
      alert('Error: Falta información del jugador o partida')
      return
    }

    try {
      const isHost = playerId1 === playerId

      // Generate deployment positions using our centralized function
      const piecesToInsert = generateDeployPositions(
        unitCounts,
        isHost,
        playerId,
        matchId
      )

      const result = await insertPieces({
        variables: {
          objects: piecesToInsert,
        },
      })

      console.log('Batallón desplegado con éxito:', result)
      onClose()
    } catch (error) {
      console.error('Error al desplegar batallón:', error)
      alert('Error al desplegar batallón. Por favor intenta de nuevo.')
    }
  }

  // Renders unit selection card for one unit type
  const renderUnitCard = (type: UnitType) => {
    const unitConfig = UNIT_CONFIGS[type]
    const icon = getUnitIcon(type)

    return (
      <div
        key={type}
        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
      >
        <div className="flex flex-col items-center mb-2">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center 
              ${unitConfig.bgColor} border-2 ${unitConfig.borderColor}`}
          >
            {icon}
          </div>
          <h3 className="text-white mt-2 font-semibold">
            {type === 'melee'
              ? 'Guerrero'
              : type === 'ranged'
                ? 'Arquero'
                : 'Soldado'}
          </h3>
          <div className="flex items-center mt-1 mb-2">
            <button
              onClick={() => handleRemoveUnit(type)}
              className="w-8 h-8 rounded-l bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white border border-gray-600"
              disabled={unitCounts[type] <= 0}
            >
              <span className="text-xl">-</span>
            </button>
            <div className="w-10 h-8 bg-gray-800 flex items-center justify-center text-amber-500 font-bold border-t border-b border-gray-600">
              {unitCounts[type]}
            </div>
            <button
              onClick={() => handleAddUnit(type)}
              className="w-8 h-8 rounded-r bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white border border-gray-600"
              disabled={totalUnits >= maxUnits}
            >
              <span className="text-xl">+</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-300 mt-2">
          <p className="mb-1">{unitConfig.description}</p>
          <p className="text-amber-400">{unitConfig.stats}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div
        className="bg-gray-900 border border-amber-900/30 rounded-lg p-6 max-w-2xl w-full h-auto"
        style={{ backgroundColor: '#1a1f2e' }}
      >
        <h2 className="text-2xl font-bold text-amber-500 text-center mb-4">
          Seleccionar Tipo de Unidad
        </h2>

        <div className="mb-5 px-2">
          <div className="flex justify-between mb-1">
            <span className="text-amber-500 text-sm font-semibold">
              Capacidad de Despliegue:
            </span>
            <span
              className={`text-sm font-semibold ${isDeploymentReady ? 'text-green-500' : 'text-amber-500'}`}
            >
              {totalUnits}/{maxUnits}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${isDeploymentReady ? 'bg-green-600' : 'bg-amber-600'}`}
              style={{ width: `${(totalUnits / maxUnits) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-1">
            <span
              className={`text-xs ${isDeploymentReady ? 'text-green-500' : 'text-gray-400'}`}
            >
              {isDeploymentReady
                ? '¡Listo para desplegar!'
                : `Selecciona exactamente ${maxUnits} unidades para desplegar`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['melee', 'ranged', 'normal'] as UnitType[]).map(renderUnitCard)}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDeploy}
            disabled={insertingPieces || !isDeploymentReady}
            className={`relative flex items-center justify-center bg-amber-900 text-gray-200 px-6 py-3 rounded border-2 border-amber-700 font-semibold transition-all
           ${
             isDeploymentReady
               ? 'hover:bg-amber-800 hover:scale-105 shadow-lg shadow-amber-900/30'
               : 'opacity-50 cursor-not-allowed bg-gray-700 border-gray-600'
           }`}
          >
            {insertingPieces ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Desplegando...
              </>
            ) : (
              'Desplegar Batallón'
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded border border-gray-700 transition hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnitSelection
