import React, { useEffect, useState } from 'react'

export default function CursorRipple() {
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    let rippleId = 0

    const createRipple = (e) => {
      const newRipple = {
        id: rippleId++,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }

      setRipples(prev => [...prev, newRipple])

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 1000)
    }

    window.addEventListener('mousemove', createRipple)
    window.addEventListener('click', createRipple)

    return () => {
      window.removeEventListener('mousemove', createRipple)
      window.removeEventListener('click', createRipple)
    }
  }, [])

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none', 
      zIndex: 9999 
    }}>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            border: '2px solid rgba(6, 182, 212, 0.6)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-expand 1s ease-out forwards',
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  )
}