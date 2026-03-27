import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/')}
      aria-label="Voltar para página principal"
      title="Voltar para página principal"
      className="fixed bottom-5 right-5 w-12 h-12 rounded-full cursor-pointer z-50"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(0,0,0,0.12)',
        backgroundImage: "url('/assets/back_btn.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '1.5rem 1.5rem',
        transition: 'background-color 200ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.72)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.55)' }}
    />
  )
}
