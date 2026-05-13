import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const API_URL = "http://localhost:8000"

async function api(path, token, options = {}) {
  const headers = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(API_URL + path, {
    ...options,
    headers
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0()
  const [list, setList] = React.useState([])
  const [msg, setMsg] = React.useState("")

  async function load() {
    try {
      const token = isAuthenticated ? await getAccessTokenSilently() : null
      const data = await api('/properties', token)
      setList(data)
      setMsg('')
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="card">
          <h2>Login Auth0</h2>
          <p>Faça login para carregar os imóveis.</p>
          <button onClick={() => loginWithRedirect()} disabled={isLoading}>
            {isLoading ? 'Carregando...' : 'Login'}
          </button>
        </div>
      ) : (
        <div className="card">
          <h2>Bem-vindo, {user?.name || user?.email}</h2>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Sair
          </button>
        </div>
      )}

      <div className="card">
        <h2>Imóveis</h2>
        <button onClick={load} disabled={isLoading || !isAuthenticated}>
          Carregar
        </button>
        {!isAuthenticated && <p>Você precisa fazer login para ver os imóveis.</p>}
        <p>{msg}</p>

        {list.map(p => (
          <div key={p.id} className="property">
            <b>{p.codigoImovel}</b><br />
            {p.preco} - {p.status}<br />
            {p.adminEmail}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
