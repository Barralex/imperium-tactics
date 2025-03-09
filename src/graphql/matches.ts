import { gql } from '@apollo/client'

// 🔹 Query para obtener partidas con estado "waiting"
export const GET_MATCHES = gql`
  query GetWaitingMatches {
    matches(order_by: { created_at: desc }) {
      id
      status
      created_at
      player1_id
      player2_id
      match_title
      total_units
    }
  }
`

// 🔹 Mutación para crear una nueva partida
export const CREATE_MATCH = gql`
  mutation CreateMatch(
    $player1_id: uuid!
    $total_units: Int!
    $match_title: String!
  ) {
    insert_matches_one(
      object: {
        status: "waiting"
        player1_id: $player1_id
        total_units: $total_units
        match_title: $match_title
      }
    ) {
      id
      status
      created_at
      total_units
      match_title
    }
  }
`

// 🔹 Mutación para unirse a una partida existente
export const JOIN_MATCH = gql`
  mutation JoinMatch($matchId: uuid!, $player2_id: uuid!) {
    update_matches_by_pk(
      pk_columns: { id: $matchId }
      _set: { player2_id: $player2_id }
    ) {
      id
      status
      player1_id
      player2_id
    }
  }
`

// 🔹 Mutación para actualizar el estado de una partida e iniciar la batalla
export const UPDATE_MATCH = gql`
  mutation UpdateMatch($matchId: uuid!, $set: matches_set_input!) {
    update_matches_by_pk(pk_columns: { id: $matchId }, _set: $set) {
      id
      status
      turn
    }
  }
`

// 🔹 Mutación para que el jugador 2 abandone una partida
export const LEAVE_MATCH = gql`
  mutation LeaveMatch($matchId: uuid!) {
    update_matches_by_pk(
      pk_columns: { id: $matchId }
      _set: { player2_id: null, status: "waiting" }
    ) {
      id
      status
      player {
        id
        email
      }
      playerByPlayer2Id {
        id
        email
      }
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
  subscription GetMatchSubscription($matchId: uuid!) {
    matches_by_pk(id: $matchId) {
      id
      status
      match_title
      total_units
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

// Definir la mutación para eliminar una partida (para el dueño)
export const DELETE_MATCH = gql`
  mutation DeleteMatch($matchId: uuid!) {
    delete_matches_by_pk(id: $matchId) {
      id
    }
  }
`

// Consulta para obtener las piezas del tablero
export const GET_PIECES = gql`
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

// Suscripción para obtener las piezas del tablero en tiempo real
export const PIECES_SUBSCRIPTION = gql`
  subscription PiecesSubscription($matchId: uuid!) {
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

// Definir la mutación GraphQL
export const INSERT_PIECES = gql`
  mutation InsertPieces($objects: [pieces_insert_input!]!) {
    insert_pieces(objects: $objects) {
      affected_rows
    }
  }
`
