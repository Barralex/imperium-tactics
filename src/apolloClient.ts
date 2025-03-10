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

const httpLink = new HttpLink({
  uri: 'https://api.imperium-tactics.com/v1/graphql',
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
      'x-hasura-admin-secret': 'hasura2025mvp',
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.imperium-tactics.com/v1/graphql',
    connectionParams: async () => {
      const token = localStorage.getItem('auth0_token')
      return token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: { 'x-hasura-admin-secret': 'hasura2025mvp' } }
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
