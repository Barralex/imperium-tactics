import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { INSERT_PIECES } from '@/graphql/matches'

const UnitSelectionModal = ({
  isOpen,
  onClose,
  maxUnidades = 10,
  playerId,
  matchId,
  connectedPlayers,
}) => {
  // Define todos los hooks primero
  const [unitCounts, setUnitCounts] = useState({
    melee: 0,
    ranged: 0,
    normal: 0,
  })

  // Inicializar la mutación - debe estar antes de cualquier lógica condicional
  const [insertPieces, { loading: insertingPieces }] =
    useMutation(INSERT_PIECES)

  // Calcular el total de unidades seleccionadas
  const totalUnits = unitCounts.melee + unitCounts.ranged + unitCounts.normal

  useEffect(() => {
    // Reiniciar contadores cuando se abre el modal
    if (isOpen) {
      setUnitCounts({
        melee: 0,
        ranged: 0,
        normal: 0,
      })
    }
  }, [isOpen])

  // Retorno temprano DESPUÉS de todos los hooks
  if (!isOpen) return null

  const handleAddUnit = (unitType) => {
    if (totalUnits < maxUnidades) {
      setUnitCounts((prev) => ({
        ...prev,
        [unitType]: prev[unitType] + 1,
      }))
    } else {
      alert(
        `¡Imposible desplegar más! Límite de ${maxUnidades} unidades alcanzado.`
      )
    }
  }

  const handleDeploy = async () => {
    if (totalUnits === 0) {
      alert('¡Debes seleccionar al menos una unidad para desplegar!')
      return
    }

    try {
      // Preparar los objetos para insertar en la BD
      const piecesToInsert = []

      // Determinar si es el host o el contrincante
      const isHost = connectedPlayers?.player?.id === playerId

      // Establecer rangos de posiciones basados en si es host o contrincante
      let startY, endY
      if (isHost) {
        // Host - Parte inferior de la grilla (filas 15-19)
        startY = 15
        endY = 19
      } else {
        // Contrincante - Parte superior de la grilla (filas 0-4)
        startY = 0
        endY = 4
      }

      // Contador para llevar un seguimiento de las posiciones ya utilizadas
      let positionCounter = 0

      // Crear objetos para unidades melee
      for (let i = 0; i < unitCounts.melee; i++) {
        // Calcular la posición en la fila
        const x = positionCounter % 20 // Distribuir a lo largo de la fila (0-19)

        // Calcular la fila dentro del rango permitido
        const y = startY + Math.floor(positionCounter / 20)

        // Solo agregar si aún estamos dentro del rango válido de filas
        if (y <= endY) {
          piecesToInsert.push({
            hp: 15,
            player_id: playerId,
            match_id: matchId,
            pos_x: x,
            pos_y: y,
            range: 0, // Melee tiene rango 0
            type: 'melee',
          })
        }

        positionCounter++
      }

      // Crear objetos para unidades de rango
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
            range: 2, // Arquero tiene rango 2
            type: 'ranged',
          })
        }

        positionCounter++
      }

      // Crear objetos para unidades normales
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
            range: 1, // Normal tiene rango 1
            type: 'normal',
          })
        }

        positionCounter++
      }

      // Ejecutar la mutación para insertar todas las piezas
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

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div
        className="bg-gray-900 border border-amber-900/30 rounded-lg p-6 max-w-md w-full"
        style={{ backgroundColor: '#1a1f2e' }}
      >
        <h3 className="text-xl font-bold text-amber-500 text-center mb-6">
          Seleccionar Tipo de Unidad
        </h3>

        {/* Barra de límite de unidades */}
        <div className="mb-6 px-2">
          <div className="flex justify-between mb-1">
            <span className="text-amber-500 text-sm">
              Capacidad de Despliegue:
            </span>
            <span className="text-amber-500 text-sm">
              {totalUnits}/{maxUnidades}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-amber-600 h-2.5 rounded-full"
              style={{ width: `${(totalUnits / maxUnidades) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-center space-x-8 mb-8">
          {/* Unidad Melee */}
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer 
                        bg-red-900 border-2 ${totalUnits < maxUnidades ? 'hover:bg-red-800 border-red-700' : 'opacity-50 cursor-not-allowed border-gray-700'}`}
              onClick={() => handleAddUnit('melee')}
            >
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
            </div>
            <span className="text-white mt-2">Melee</span>
            <span className="text-amber-500 font-bold">{unitCounts.melee}</span>
          </div>

          {/* Unidad Rango */}
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer 
                        bg-blue-900 border-2 ${totalUnits < maxUnidades ? 'hover:bg-blue-800 border-blue-700' : 'opacity-50 cursor-not-allowed border-gray-700'}`}
              onClick={() => handleAddUnit('ranged')}
            >
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
            </div>
            <span className="text-white mt-2">Rango</span>
            <span className="text-amber-500 font-bold">
              {unitCounts.ranged}
            </span>
          </div>

          {/* Unidad Normal */}
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer 
                        bg-amber-800 border-2 ${totalUnits < maxUnidades ? 'hover:bg-amber-700 border-amber-600' : 'opacity-50 cursor-not-allowed border-gray-700'}`}
              onClick={() => handleAddUnit('normal')}
            >
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
            </div>
            <span className="text-white mt-2">Normal</span>
            <span className="text-amber-500 font-bold">
              {unitCounts.normal}
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-amber-500 font-bold">
            Unidades seleccionadas: {totalUnits}
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDeploy}
            disabled={insertingPieces || totalUnits === 0}
            className={`bg-green-900 hover:bg-green-800 text-gray-200 px-6 py-2 rounded border border-green-700 font-semibold transition
                       ${insertingPieces || totalUnits === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {insertingPieces ? 'Desplegando...' : 'Desplegar Batallón'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded border border-gray-700 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnitSelectionModal
