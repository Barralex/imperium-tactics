// useMatchPage.ts
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'
import {
  GET_MATCH_SUBSCRIPTION,
  UPDATE_MATCH,
  LEAVE_MATCH,
} from '../graphql/matches'
import { MatchDetails } from '../types'

export const useMatchPage = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [connectedPlayers, setConnectedPlayers] = useState<MatchDetails | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth0()

  const currentPlayerId =
    user?.['https://hasura.io/jwt/claims']?.['x-hasura-user-id']

  // Suscribirse a cambios en la partida
  const { data, loading, error } = useSubscription(GET_MATCH_SUBSCRIPTION, {
    variables: { matchId },
  })

  useEffect(() => {
    console.log('📡 Suscripción recibida:', data)
    if (data) {
      // Verificar si la partida existe
      if (!data.matches_by_pk) {
        console.log('La partida ya no existe')
        alert('La partida ya no existe. Serás redirigido al lobby.')
        navigate('/')
        return
      }

      setConnectedPlayers(data.matches_by_pk)

      // Verificar si el jugador actual sigue en la partida
      const player1Id = data.matches_by_pk.player?.id
      const player2Id = data.matches_by_pk.playerByPlayer2Id?.id

      if (
        currentPlayerId &&
        player1Id !== currentPlayerId &&
        player2Id !== currentPlayerId
      ) {
        console.log('Has sido expulsado de la partida')
        alert('Ya no formas parte de esta partida')
        navigate('/')
      }
    }
  }, [data, currentPlayerId, navigate])

  // Mutaciones para la gestión de partidas
  const [leaveMatch, { loading: leavingMatch }] = useMutation(LEAVE_MATCH)
  const [updateMatch, { loading: updatingMatch }] = useMutation(UPDATE_MATCH)

  const handleLeaveMatch = () => {
    leaveMatch({
      variables: { matchId },
      onCompleted: (data) => {
        console.log('Has abandonado la partida con éxito:', data)
        navigate('/')
      },
      onError: (error) => {
        console.error('Error al abandonar la partida:', error)
      },
    })
  }

  const handleStartBattle = () => {
    if (!connectedPlayers || !connectedPlayers.playerByPlayer2Id) return

    console.log('Iniciando batalla...')
    const randomPlayer =
      Math.random() < 0.5
        ? connectedPlayers.player.id
        : connectedPlayers.playerByPlayer2Id.id

    updateMatch({
      variables: {
        matchId,
        set: {
          status: 'in_progress',
          turn: randomPlayer,
        },
      },
      onCompleted: (data) => {
        console.log('Batalla iniciada con éxito:', data)
      },
      onError: (error) => {
        console.error('Error al iniciar la batalla:', error)
        alert('Error al iniciar la batalla. Por favor intenta de nuevo.')
      },
    })
  }

  const handleBackToLobby = () => {
    navigate('/')
  }

  const handleDeployUnit = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return {
    matchId,
    currentPlayerId,
    connectedPlayers,
    isModalOpen,
    loading,
    error,
    leavingMatch,
    updatingMatch,
    handleLeaveMatch,
    handleStartBattle,
    handleBackToLobby,
    handleDeployUnit,
    handleCloseModal,
  }
}
