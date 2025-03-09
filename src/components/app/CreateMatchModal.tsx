// src/components/CreateMatchModal.tsx
import React, { useState } from 'react'

interface CreateMatchModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => void
  isLoading: boolean
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

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

    // Enviar el nombre de la sala al componente padre
    onSubmit(name)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Crear nueva sala
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="matchName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de la sala
            </label>
            <input
              id="matchName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('') // Limpiar el error al escribir
              }}
              className={`w-full px-3 text-gray-700 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="Ingresa un nombre para tu sala"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'Creando...' : 'Crear sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMatchModal
