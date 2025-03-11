import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from './MatchesLobby/UIComponents'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="imperial-icon mb-6">
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-amber-500 mx-auto"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9H9.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 9H15.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 14H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="text-5xl text-amber-500 font-bold mb-4">404</h1>
      <h2 className="text-2xl text-amber-400 font-bold mb-6">ZONA PROHIBIDA DEL SECTOR IMPERIAL</h2>
      
      <div className="max-w-md text-gray-300 mb-8">
        <p className="mb-4">
          Esta región del imperio no está bajo nuestro control.
        </p>
      </div>

      <LoadingButton
        onClick={() => navigate('/')}
        isLoading={false}
        loadingText=""
        className="bg-amber-700 hover:bg-amber-600 text-black px-6 py-3"
      >
        Volver al Comando Imperial
      </LoadingButton>
    </div>
  )
}

export default NotFound