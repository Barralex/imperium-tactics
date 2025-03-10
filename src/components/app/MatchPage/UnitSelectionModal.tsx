import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { INSERT_PIECES } from '@/graphql/matches'

type UnitType = 'melee' | 'ranged' | 'normal'

interface UnitSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  maxUnits?: number
  playerId: string
  matchId: string | undefined
  playerId1: string | undefined
}

const UnitSelectionModal = ({
  isOpen,
  onClose,
  maxUnits = 5,
  playerId,
  matchId,
  playerId1,
}: UnitSelectionModalProps) => {
  const [unitCounts, setUnitCounts] = useState<{
    melee: number
    ranged: number
    normal: number
  }>({
    melee: 0,
    ranged: 0,
    normal: 0,
  })

  const [insertPieces, { loading: insertingPieces }] =
    useMutation(INSERT_PIECES)

  const totalUnits = unitCounts.melee + unitCounts.ranged + unitCounts.normal

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

    try {
      const piecesToInsert = []

      const isHost = playerId1 === playerId

      let startY, endY

      if (isHost) {
        startY = 15
        endY = 19
      } else {
        startY = 0
        endY = 4
      }

      let positionCounter = 0

      for (let i = 0; i < unitCounts.melee; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 15,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 0,
            type: 'melee',
          })
        }

        positionCounter++
      }

      for (let i = 0; i < unitCounts.ranged; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 10,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 2,
            type: 'ranged',
          })
        }

        positionCounter++
      }

      for (let i = 0; i < unitCounts.normal; i++) {
        const x = positionCounter % 20
        const y = startY + Math.floor(positionCounter / 20)

        if (y <= endY) {
          piecesToInsert.push({
            hp: 12,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 1,
            type: 'normal',
          })
        }

        positionCounter++
      }

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

  const unitInfo = {
    melee: {
      name: 'Guerrero',
      description: 'Unidades cuerpo a cuerpo con alto HP',
      stats: 'HP: 15 | Alcance: 0 | Especialidad: combate frontal',
      bgColor: 'bg-red-900',
      hoverColor: 'hover:bg-red-800',
      borderColor: 'border-red-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    ranged: {
      name: 'Arquero',
      description: 'Unidades de ataque a distancia',
      stats: 'HP: 10 | Alcance: 2 | Especialidad: ataques de largo alcance',
      bgColor: 'bg-blue-900',
      hoverColor: 'hover:bg-blue-800',
      borderColor: 'border-blue-700',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
          />
        </svg>
      ),
    },
    normal: {
      name: 'Soldado',
      description: 'Unidades versátiles equilibradas',
      stats: 'HP: 12 | Alcance: 1 | Especialidad: adaptabilidad',
      bgColor: 'bg-amber-800',
      hoverColor: 'hover:bg-amber-700',
      borderColor: 'border-amber-600',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          />
        </svg>
      ),
    },
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
          {(Object.keys(unitInfo) as UnitType[]).map((type) => (
            <div
              key={type}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex flex-col items-center mb-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center 
                    ${unitInfo[type].bgColor} border-2 ${unitInfo[type].borderColor}`}
                >
                  {unitInfo[type].icon}
                </div>
                <h3 className="text-white mt-2 font-semibold">
                  {unitInfo[type].name}
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
                <p className="mb-1">{unitInfo[type].description}</p>
                <p className="text-amber-400">{unitInfo[type].stats}</p>
              </div>
            </div>
          ))}
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

export default UnitSelectionModal
