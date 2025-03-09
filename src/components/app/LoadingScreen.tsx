import React, { useEffect, useState } from 'react'

const LoadingScreen = () => {
  const [dots, setDots] = useState('.')
  const [pulseEffect, setPulseEffect] = useState(false)
  const [rotationDeg, setRotationDeg] = useState(0)

  // Efecto para la animación de los puntos suspensivos
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'))
    }, 400)

    return () => clearInterval(dotsInterval)
  }, [])

  // Efecto de pulso para el círculo central
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseEffect((prev) => !prev)
    }, 1500)

    return () => clearInterval(pulseInterval)
  }, [])

  // Efecto de rotación para el borde exterior
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotationDeg((prev) => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(rotationInterval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      {/* Fondo con patrón cuadriculado y gradiente */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.7) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      {/* Partículas brillantes aleatorias */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-1 h-1 rounded-full bg-amber-500 opacity-${Math.random() > 0.5 ? '50' : '70'}`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `pulse ${1 + Math.random() * 3}s infinite`,
          }}
        />
      ))}

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Círculo exterior rotativo */}
        <div
          className="w-48 h-48 rounded-full border-4 border-amber-600 border-dashed absolute opacity-60"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
        />

        {/* Círculo medio pulsante */}
        <div
          className={`w-40 h-40 rounded-full bg-gray-900 border-2 border-amber-500 flex items-center justify-center transition-all duration-1000 ${pulseEffect ? 'scale-105 border-amber-400' : 'scale-100'}`}
        >
          {/* Círculo interior */}
          <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center shadow-lg shadow-amber-900/20">
            {/* Símbolo Adeptus Mechanicus */}
            <div className="w-20 h-20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center">
                  {/* Engranaje exterior */}
                  <div className="w-full h-full absolute">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-6 bg-amber-500"
                        style={{
                          left: '50%',
                          top: '50%',
                          transformOrigin: '0 0',
                          transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-8px)`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Calavera interior */}
                  <div className="w-12 h-12 relative z-10">
                    {/* Forma de la calavera */}
                    <div className="w-10 h-10 bg-amber-500 rounded-full mx-auto" />

                    {/* Ojos */}
                    <div className="absolute top-3 left-1 w-3 h-2 bg-gray-900 rounded-sm" />
                    <div className="absolute top-3 right-1 w-3 h-2 bg-gray-900 rounded-sm" />

                    {/* Nariz */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-1 bg-gray-900" />

                    {/* Mandíbula */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-gray-900 rounded-sm" />

                    {/* Dientes */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 flex justify-between">
                      <div className="w-1 h-1 bg-amber-500"></div>
                      <div className="w-1 h-1 bg-amber-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Texto de carga - solo título sin espera ni barra */}
        <div className="mt-12 text-center">
          <h2 className="text-amber-500 text-2xl font-bold tracking-wider mb-3">
            PREPARANDO BATALLA
          </h2>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
