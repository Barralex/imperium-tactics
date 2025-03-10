import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'

// 🔹 HTTP Link para Queries & Mutations
const httpLink = new HttpLink({
  uri:
    import.meta.env.VITE_HASURA_GRAPHQL_URL ||
    'https://api.imperium-tactics.com/v1/graphql',
})

// 🔹 Middleware para autenticación
const authLink = setContext(async (_, { headers }) => {
  const token = localStorage.getItem('auth0_token')
  if (token) {
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': 'hasura2025mvp',
    },
  }
})

// 🔹 WebSocket Link para Subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url:
      import.meta.env.VITE_HASURA_GRAPHQL_WS_URL ||
      'wss://api.imperium-tactics.com/v1/graphql', // ⚠️ Reemplázalo con `wss://` si es producción
    connectionParams: async () => {
      const token = localStorage.getItem('auth0_token')
      return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: { 'x-hasura-admin-secret': 'hasura2025mvp' } }
    },
  })
)

// 🔹 `split()` decide si usar HTTP o WebSockets
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  from([authLink, httpLink])
)

// 🔹 Apollo Client con WebSockets y HTTP
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
  },
})

export default client
