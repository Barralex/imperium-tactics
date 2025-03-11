import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import MatchesLobby from './components/app/Lobby'

const App: React.FC = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0()

  // Obtener el avatar desde los claims de Hasura o fallback a user.picture
  const avatarUrl =
    user?.['https://hasura.io/jwt/claims']?.avatar || user?.picture

  return (
    <div className="min-h-screen relative overflow-hidden imperial-background">
      {/* Overlay de ruido sutil */}
      <div className="absolute inset-0 noise-overlay pointer-events-none z-10"></div>

      {/* Líneas de escaneo horizontales */}
      <div className="scan-line"></div>

      {/* Decoraciones imperiales en las esquinas */}
      <div className="imperial-corner top-left"></div>
      <div className="imperial-corner top-right"></div>
      <div className="imperial-corner bottom-left"></div>
      <div className="imperial-corner bottom-right"></div>

      <div className="container mx-auto px-6 relative z-20">
        <header className="imperial-header py-8 mb-12 relative">
          {/* Logo y lema centrados */}
          <div className="text-center mb-6">
            <h1 className="main-title text-yellow-500 text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-3">
              WARHAMMER 40,000
            </h1>
            <div className="w-36 h-1 bg-yellow-500 mx-auto mb-3"></div>
            <p className="imperial-quote text-yellow-400 italic text-lg md:text-xl">
              "En el sombrío futuro del 41º Milenio, solo existe la guerra"
            </p>
          </div>

          {/* Sección de autenticación - Posicionada absolutamente en la esquina superior derecha */}
          <div className="absolute top-0 right-0 mt-4 mr-4">
            {isAuthenticated ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-2">
                  <div className="mr-3">
                    <p className="text-yellow-500 font-bold">
                      Bienvenido,{' '}
                      <span className="text-yellow-300">{user?.name}</span>
                    </p>
                  </div>
                  {avatarUrl && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500">
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-1.5 px-4 rounded border border-red-900 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <span className="mr-1">Cerrar sesión</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-6 rounded border-2 border-yellow-500 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </header>

        <main>
          {/* Lista de partidas o tu lógica principal */}
          <MatchesLobby />
        </main>
      </div>
    </div>
  )
}

export default App
