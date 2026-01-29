import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_URL,
  headers: {
    // Only use admin secret on server side
    ...(typeof window === 'undefined' && process.env.HASURA_ADMIN_SECRET
      ? { 'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET }
      : {}),
  },
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})