// src/services/graphqlService.ts
import client from '@/lib/apolloClient'
import { DocumentNode, GraphQLError } from 'graphql'
import { FetchPolicy, MutationFetchPolicy } from '@apollo/client'

// Define el tipo de la suscripción
type Subscription = {
  unsubscribe: () => void
}

/**
 * Servicio centralizado para operaciones GraphQL
 */
export const graphqlService = {
  /**
   * Ejecuta una consulta GraphQL
   * @param options Opciones de la consulta
   * @returns Datos y errores de la respuesta
   */
  query: async <T>(options: {
    query: DocumentNode
    variables?: Record<string, unknown>
    fetchPolicy?: FetchPolicy
  }): Promise<{ data: T; errors?: readonly GraphQLError[] }> => {
    try {
      const result = await client.query({
        query: options.query,
        variables: options.variables,
        fetchPolicy: options.fetchPolicy || 'network-only',
      })
      return {
        data: result.data as T,
        errors: result.errors as readonly GraphQLError[] | undefined,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },

  /**
   * Ejecuta una mutación GraphQL
   * @param options Opciones de la mutación
   * @returns Datos y errores de la respuesta
   */
  mutate: async <T>(options: {
    mutation: DocumentNode
    variables?: Record<string, unknown>
    fetchPolicy?: FetchPolicy
    refetchQueries?: Array<{ query: DocumentNode; variables?: Record<string, unknown> }>
  }): Promise<{ data: T; errors?: unknown }> => {
    try {
      const result = await client.mutate({
        mutation: options.mutation,
        variables: options.variables,
        fetchPolicy: options.fetchPolicy as MutationFetchPolicy,
        refetchQueries: options.refetchQueries,
      })
      return { data: result.data as T, errors: result.errors }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  },

  /**
   * Crea una suscripción GraphQL
   * @param subscription La consulta de suscripción
   * @param variables Variables para la suscripción
   * @param onData Callback para procesar datos recibidos
   * @param onError Callback opcional para manejar errores
   * @returns La suscripción creada
   */
  subscribe: <T>(
    subscription: DocumentNode,
    variables: Record<string, unknown>,
    onData: (data: T) => void,
    onError?: (error: unknown) => void
  ): Subscription => {
    const observable = client.subscribe({
      query: subscription,
      variables,
    })

    return observable.subscribe({
      next: ({ data }) => onData(data as T),
      error: (error) => {
        if (onError) onError(error)
        else console.error('Subscription error:', error)
      },
    })
  },
}
