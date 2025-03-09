// useMatches.ts
import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import {
  GET_MATCHES,
  CREATE_MATCH,
  JOIN_MATCH,
  DELETE_MATCH,
} from '../graphql/matches'
import { Match } from '../types'

export const useMatches = () => {
  const { isAuthenticated, user } = useAuth0()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [joiningMatchId, setJoiningMatchId] = useState<string | null>(null)
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null)

  const currentPlayerId =
    user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  // Consulta para obtener salas en espera
  const { loading, error, data, refetch } = useQuery(GET_MATCHES, {
    pollInterval: 5000,
    onError: (err) => {
      console.error('Error con la primera consulta:', err.message)
    },
  })

  // Mutación para crear una nueva sala
  const [createMatch, { loading: creatingMatch }] = useMutation(CREATE_MATCH, {
    onCompleted: () => {
      setIsModalOpen(false)
      refetch()
    },
  })

  // Mutación para unirse a una partida existente
  const [joinMatch, { loading: joiningMatch }] = useMutation(JOIN_MATCH, {
    onCompleted: (data) => {
      console.log('✅ Unido a la partida:', data)
      // Redireccionar después de unirse exitosamente
      navigate(`/match/${joiningMatchId}`)
      setJoiningMatchId(null)
    },
    onError: (error) => {
      console.error('❌ Error al unirse a la partida:', error)
      setJoiningMatchId(null)
    },
  })

  // Mutación para eliminar una partida (solo disponible para el creador)
  const [deleteMatch, { loading: deletingMatch }] = useMutation(DELETE_MATCH, {
    onCompleted: (data) => {
      console.log('✅ Partida eliminada con éxito:', data)
      setDeletingMatchId(null)
      refetch()
    },
    onError: (error) => {
      console.error('❌ Error al eliminar la partida:', error)
      setDeletingMatchId(null)
    },
  })

  const handleCreateMatch = (name: string, totalUnits: number) => {
    // Verificar que el ID del usuario esté disponible
    if (!currentPlayerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    createMatch({
      variables: {
        player1_id: currentPlayerId,
        total_units: totalUnits,
        match_title: name,
      },
    })
  }

  // Manejar la entrada a una partida
  const handleEnterMatch = (match: Match) => {
    if (!isAuthenticated || !user) {
      return
    }

    if (!currentPlayerId) {
      console.error(
        '❌ No se encontró el UUID del jugador en los claims de Hasura.'
      )
      return
    }

    // Verificar si el usuario es el creador de la partida
    if (match.player1_id === currentPlayerId) {
      // Si es el creador, solo redirigir
      console.log('🔄 Redirigiendo al creador a su partida')
      navigate(`/match/${match.id}`)
      return
    }

    // Si no es el creador y la partida no tiene un segundo jugador, unirse
    if (!match.player2_id) {
      setJoiningMatchId(match.id)
      joinMatch({
        variables: {
          matchId: match.id,
          player2_id: currentPlayerId,
        },
      })
    } else if (match.player2_id === currentPlayerId) {
      navigate(`/match/${match.id}`)
    } else {
      alert('❌ Esta partida ya tiene dos jugadores y no eres uno de ellos')
    }
  }

  // Función para eliminar una partida (solo disponible para el creador)
  const handleDeleteMatch = (matchId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta partida?')) {
      setDeletingMatchId(matchId)
      deleteMatch({
        variables: {
          matchId: matchId,
        },
      })
    }
  }

  const matches = data?.matches || []

  return {
    isAuthenticated,
    currentPlayerId,
    loading,
    error,
    matches,
    creatingMatch,
    joiningMatchId,
    joiningMatch,
    deletingMatchId,
    deletingMatch,
    isModalOpen,
    setIsModalOpen,
    refetch,
    handleCreateMatch,
    handleEnterMatch,
    handleDeleteMatch,
  }
}
