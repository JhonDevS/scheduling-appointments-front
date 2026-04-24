import './Home.css'

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">¡Hola!</h1>
        <p className="home-subtitle">Bienvenido a SaludYa</p>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('isAuthenticated')
          window.location.href = '/login'
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default Home