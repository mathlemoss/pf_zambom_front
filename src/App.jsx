import React from 'react'

const API_URL = "http://localhost:8000"

async function api(path, options = {}) {
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

function App() {
  const [list, setList] = React.useState([])
  const [msg, setMsg] = React.useState("")

  async function load() {
    try {
      const data = await api('/properties')
      setList(data)
      setMsg('')
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Imóveis</h2>
        <button onClick={load}>Carregar</button>
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
