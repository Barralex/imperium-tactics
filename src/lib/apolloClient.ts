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

const API_URL =
  import.meta.env.VITE_API_URL || 'https://api.imperium-tactics.com/v1/graphql'
const WS_URL =
  import.meta.env.VITE_WS_URL || 'wss://api.imperium-tactics.com/v1/graphql'
const ADMIN_SECRET = import.meta.env.VITE_HASURA_ADMIN_SECRET || ''

const httpLink = new HttpLink({
  uri: API_URL,
})

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
      ...(ADMIN_SECRET ? { 'x-hasura-admin-secret': ADMIN_SECRET } : {}),
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: async () => {
      const token = localStorage.getItem('auth0_token')
      if (token) {
        return { headers: { Authorization: `Bearer ${token}` } }
      }
      return ADMIN_SECRET
        ? { headers: { 'x-hasura-admin-secret': ADMIN_SECRET } }
        : {}
    },
  })
)

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

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
  },
})

export default client
