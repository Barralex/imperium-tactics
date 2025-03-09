import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Auth0Provider } from '@auth0/auth0-react'
import client from './apolloClient'
import App from './App'
import MatchPage from './components/app/MatchPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-6ukt98d8.us.auth0.com"
      clientId="ujZtss5MlmLJZqTv6RAg8RfYC0czTopZ"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'https://imperium-tactics.com',
      }}
      cacheLocation="localstorage"
    >
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/match/:matchId" element={<MatchPage />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </Auth0Provider>
  </React.StrictMode>
)
