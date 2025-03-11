import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import client from './lib/apolloClient'
import App from './App'
import Match from './components/app/Match'
import './index.css'
import NotFound from './components/app/NotFound'

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
        {/* Envuelve TODAS las rutas con el DnDProvider */}
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/match/:matchId" element={<Match />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DndProvider>
      </ApolloProvider>
    </Auth0Provider>
  </React.StrictMode>
)
