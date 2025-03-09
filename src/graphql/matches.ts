import { gql } from '@apollo/client'

// 🔹 Query para obtener partidas con estado "waiting"
export const GET_WAITING_MATCHES = gql`
  query GetWaitingMatches {
    matches(
      where: { status: { _eq: "waiting" } }
      order_by: { created_at: desc }
    ) {
      id
      status
      created_at
      player1_id
      player2_id
    }
  }
`

// 🔹 Mutación para crear una nueva partida
export const CREATE_MATCH = gql`
  mutation CreateMatch($player1_id: uuid!) {
    insert_matches_one(object: { status: "waiting", player1_id: $player1_id }) {
      id
      status
      created_at
    }
  }
`

// 🔹 Mutación para unirse a una partida existente
export const JOIN_MATCH = gql`
  mutation JoinMatch($matchId: uuid!, $player2_id: uuid!) {
    update_matches_by_pk(
      pk_columns: { id: $matchId }
      _set: { player2_id: $player2_id, status: "playing" }
    ) {
      id
      status
      player1_id
      player2_id
    }
  }
`

// 🔹 Query para obtener detalles de una partida específica
export const GET_MATCH_DETAILS = gql`
  query GetMatchDetails($matchId: uuid!) {
    matches_by_pk(id: $matchId) {
      id
      status
      created_at
      player1_id
      player2_id
      turn
    }
  }
`

// 🔹 Función para obtener el UUID de un jugador a partir de su auth0_id
export const FETCH_PLAYER_UUID = gql`
  query GetPlayerUUID($auth0_id: String!) {
    players(where: { auth0_id: { _eq: $auth0_id } }) {
      id
    }
  }
`

// 🔹 Suscripción para escuchar cambios en la partida en tiempo real
export const GET_MATCH_SUBSCRIPTION = gql`
  subscription GetMatchUpdates($matchId: uuid!) {
    matches_by_pk(id: $matchId) {
      id
      status
      player {
        id
        email
        avatar
      }
      playerByPlayer2Id {
        id
        email
        avatar
      }
    }
  }
`
