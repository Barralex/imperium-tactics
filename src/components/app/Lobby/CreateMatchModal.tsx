// Lobby/components/CreateMatchModal.tsx
import React, { useState, useEffect } from 'react'

interface CreateMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, totalUnits: number) => void
  isLoading: boolean
}

/**
 * Modal para crear una nueva partida con opciones configurables
 */
const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState('')
  const [totalUnits, setTotalUnits] = useState(5)
  const [error, setError] = useState('')
  
  // Resetear valores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setName('')
      setTotalUnits(5)
      setError('')
    }
  }, [isOpen])

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el nombre de la sala
    if (!name.trim()) {
      setError('El nombre de la sala es obligatorio')
      return
    }

    if (name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    onSubmit(name, totalUnits)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div 
        className="bg-gray-900 border border-amber-900 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic en el contenido
      >
        <h2 className="text-xl font-bold mb-4 text-amber-500">
          Crear nueva Campaña
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Campo para el nombre de la sala */}
          <div className="mb-4">
            <label
              htmlFor="matchName"
              className="block text-amber-400 font-medium mb-2"
            >
              Nombre de la Campaña
            </label>
            <input
              id="matchName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('') // Limpiar el error al escribir
              }}
              className={`w-full px-3 py-2 border bg-gray-800 text-white ${
                error
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-700 focus:ring-amber-500'
              } rounded-md focus:outline-none focus:ring-2`}
              placeholder="Ingresa un nombre para tu campaña"
              disabled={isLoading}
              data-testid="match-name-input"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {/* Selector de unidades */}
          <div className="mb-6">
            <label
              htmlFor="totalUnits"
              className="block text-amber-400 font-medium mb-2"
            >
              Unidades Disponibles
            </label>

            <input
              id="totalUnits"
              type="range"
              min="1"
              max="10"
              value={totalUnits}
              onChange={(e) => setTotalUnits(parseInt(e.target.value))}
              className="w-full accent-amber-500 mb-2"
              data-testid="units-range"
            />

            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Mínimo: 1</span>
              <span className="text-lg font-bold text-amber-500">
                {totalUnits}
              </span>
              <span className="text-sm text-gray-400">Máximo: 10</span>
            </div>

            <p className="text-sm text-gray-400">
              Cada jugador tendrá {totalUnits} unidades para desplegar en el
              campo de batalla.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={isLoading}
              data-testid="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-black font-bold rounded-md transition-colors disabled:opacity-70"
              disabled={isLoading}
              data-testid="create-button"
            >
              {isLoading ? 'Creando...' : 'Iniciar Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMatchModal