import React from 'react'

const API_URL = "http://localhost:8000"
const ROLES_CLAIM = "https://properties-api/roles"

function decode(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function getRoles(token) {
  const payload = decode(token)
  if (!payload) return []

  let roles = []
  if (Array.isArray(payload[ROLES_CLAIM])) roles.push(...payload[ROLES_CLAIM])
  if (Array.isArray(payload.permissions)) roles.push(...payload.permissions)

  return [...new Set(roles)]
}

async function api(path, token, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function App() {
  const [token, setToken] = React.useState("")
  const [list, setList] = React.useState([])
  const [msg, setMsg] = React.useState("")

  const [codigo, setCodigo] = React.useState("")
  const [preco, setPreco] = React.useState("")
  const [status, setStatus] = React.useState("DISPONIVEL")

  const roles = getRoles(token)
  const isAdmin = roles.includes("ADMIN")
  const isUser = roles.includes("USER") || isAdmin

  async function load() {
    try {
      const data = await api('/properties', token)
      setList(data)
    } catch (e) {
      setMsg(e.message)
    }
  }

  async function create(e) {
    e.preventDefault()
    try {
      await api('/properties', token, {
        method: 'POST',
        body: JSON.stringify({ codigoImovel: codigo, preco: Number(preco), status })
      })
      setMsg('Criado!')
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  async function del(id) {
    try {
      await api('/properties/' + id, token, { method: 'DELETE' })
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Token</h2>
        <textarea value={token} onChange={e => setToken(e.target.value)} />
        <p>Roles: {roles.join(', ') || 'nenhuma'}</p>
      </div>

      {isAdmin && (
        <div className="card">
          <h2>Cadastrar</h2>
          <form onSubmit={create} className="grid">
            <input placeholder="codigo" value={codigo} onChange={e => setCodigo(e.target.value)} />
            <input placeholder="preco" value={preco} onChange={e => setPreco(e.target.value)} />
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>DISPONIVEL</option>
              <option>VENDIDO</option>
              <option>CANCELADO</option>
            </select>
            <button>Cadastrar</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Imóveis</h2>
        <button onClick={load}>Carregar</button>
        <p>{msg}</p>

        {list.map(p => (
          <div key={p.id} className="property">
            <b>{p.codigoImovel}</b><br />
            {p.preco} - {p.status}<br />
            {p.adminEmail}

            {isAdmin && (
              <button onClick={() => del(p.id)}>Excluir</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
