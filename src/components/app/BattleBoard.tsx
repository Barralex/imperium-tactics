import { useQuery, gql } from '@apollo/client'
import { useParams } from 'react-router-dom'

// Consulta para obtener las piezas del tablero
const GET_PIECES = gql`
  query GetPieces($matchId: uuid!) {
    pieces(where: { match_id: { _eq: $matchId } }) {
      id
      hp
      player_id
      pos_x
      pos_y
      range
      type
      movement
    }
  }
`

const BattleBoard = () => {
  const { matchId } = useParams()
  const size = 20

  // Consultar las piezas de esta partida
  const { data, loading, error } = useQuery(GET_PIECES, {
    variables: { matchId },
    pollInterval: 2000, // Actualizar cada 2 segundos
  })

  // Mapa para almacenar las piezas por posición
  const pieceMap = {}

  // Si tenemos datos, crear un mapa de piezas por posición
  if (data && data.pieces) {
    data.pieces.forEach((piece) => {
      const key = `${piece.pos_x}-${piece.pos_y}`
      pieceMap[key] = piece
    })
  }

  // Función para renderizar una pieza
  const renderPiece = (piece) => {
    let bgColor, borderColor, icon

    // Determinar el estilo por tipo
    if (piece.type === 'melee') {
      bgColor = 'bg-red-900'
      borderColor = 'border-red-700'
      icon = '✖'
    } else if (piece.type === 'rango') {
      bgColor = 'bg-blue-900'
      borderColor = 'border-blue-700'
      icon = '◎'
    } else if (piece.type === 'normal') {
      bgColor = 'bg-amber-800'
      borderColor = 'border-amber-600'
      icon = '⋯'
    }

    return (
      <div
        className={`absolute inset-0.5 ${bgColor} rounded-full flex items-center justify-center text-white font-bold
                  border-2 ${borderColor} shadow-inner overflow-hidden`}
        title={`${piece.type.toUpperCase()} | HP: ${piece.hp} | Rango: ${piece.range}`}
      >
        <span className="text-xs">{icon}</span>
      </div>
    )
  }

  // Crear el tablero
  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const key = `${x}-${y}`
      const piece = pieceMap[key]

      cells.push(
        <div
          key={key}
          className={`w-6 h-6 border border-gray-800 ${
            (x + y) % 2 === 0 ? 'bg-gray-900/80' : 'bg-black/70'
          } relative`}
          data-x={x}
          data-y={y}
        >
          {piece && renderPiece(piece)}
        </div>
      )
    }
  }

  return (
    <div className="inline-block border-2 border-gray-700 bg-black/80 p-2 rounded shadow-lg relative">
      {loading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-amber-500 z-10">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 mb-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="font-bold">Cargando despliegue de tropas...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-500 z-10">
          <div className="flex flex-col items-center">
            <svg
              className="h-8 w-8 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-bold">
              Error en la transmisión de datos del campo de batalla
            </span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-20 gap-0">{cells}</div>
    </div>
  )
}

export default BattleBoard
