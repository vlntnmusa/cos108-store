import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const EMPTY = { name: '', description: '', price: '', stock: '', image_url: '' }

export default function AdminDashboard() {
  const [tab, setTab]           = useState('products')
  const [products, setProducts] = useState([])
  const [users, setUsers]       = useState([])
  const [sales, setSales]       = useState([])
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState(null)
  const [msg, setMsg]           = useState(null)

  const load = () => Promise.all([
    api.get('/api/products').then(setProducts),
    api.get('/api/admin/users').then(setUsers),
    api.get('/api/admin/sales').then(setSales),
  ])
  useEffect(() => { load() }, [])

  const flash = (text, ok = true) => {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      editing
        ? await api.put(`/api/products/${editing}`, form)
        : await api.post('/api/products', form)
      flash(editing ? 'Product updated' : 'Product created')
      setForm(EMPTY); setEditing(null); load()
    } catch (err) { flash(err.message, false) }
  }

  const handleEdit = (p) => {
    setEditing(p.id)
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, image_url: p.image_url || '' })
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/api/products/${id}`)
    flash('Product deleted'); load()
  }

  const chartData = {
    labels: sales.map(s => s.date),
    datasets: [{
      label: 'Revenue', data: sales.map(s => s.revenue),
      borderColor: '#0071E3', backgroundColor: 'rgba(0,113,227,.08)',
      tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#0071E3',
    }]
  }

  const TABS = [
    { key: 'products', label: 'Products' },
    { key: 'users',    label: 'Users' },
    { key: 'sales',    label: 'Sales' },
  ]

  return (
    <div className="page">
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.4px' }}>Admin</h1>
        <button className="btn btn-outline btn-sm" onClick={() => api.download('/api/orders/export')}>
          Export orders CSV
        </button>
      </div>

      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: 14, fontWeight: 500,
          background: msg.ok ? '#E8F5E9' : '#FFEBEE', color: msg.ok ? '#2E7D32' : '#C62828',
          animation: 'fadeUp 0.2s var(--ease)',
        }}>{msg.text}</div>
      )}

      <div className="tabs fade-up-2">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{products.length} products</p>
            {/* Low stock alerts */}
            {products.filter(p => p.stock <= 5 && p.stock > 0).length > 0 && (
              <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#E65100', marginBottom: 8 }}>⚠ Low Stock Alert</p>
                {products.filter(p => p.stock <= 5 && p.stock > 0).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#BF360C' }}>{p.name}</span>
                    <span style={{ fontWeight: 600, color: '#E65100' }}>{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
            {products.filter(p => p.stock === 0).length > 0 && (
              <div style={{ background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#C62828', marginBottom: 8 }}>🚫 Out of Stock</p>
                {products.filter(p => p.stock === 0).map(p => (
                  <div key={p.id} style={{ fontSize: 13, color: '#B71C1C', marginBottom: 4 }}>{p.name}</div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {products.map((p, i) => (
                <div key={p.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 18px',
                  animation: `fadeUp 0.3s ${i*0.04}s var(--ease) both` }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--border-light)' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-2)' }}>${p.price.toFixed(2)} · {p.stock} in stock</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: '#FFEBEE', color: 'var(--danger)', border: 'none' }} onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card fade-up-3" style={{ position: 'sticky', top: 72 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
              {editing ? 'Edit product' : 'Add product'}
            </h3>
            <form onSubmit={handleSubmit}>
              {[
                { key: 'name',        label: 'Name',        type: 'text',   required: true },
                { key: 'description', label: 'Description', type: 'area',   required: false },
                { key: 'price',       label: 'Price ($)',   type: 'number', required: true },
                { key: 'stock',       label: 'Stock',       type: 'number', required: true },
                { key: 'image_url',   label: 'Image URL',  type: 'text',   required: false },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="label" htmlFor={`admin-${f.key}`}>{f.label}</label>
                  {f.type === 'area'
                    ? <textarea id={`admin-${f.key}`} name={f.key} className="input" rows={2} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    : <input id={`admin-${f.key}`} name={f.key} className="input" type={f.type} step={f.type === 'number' && f.key === 'price' ? '0.01' : undefined}
                        value={form[f.key]} required={f.required}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  }
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editing ? 'Update' : 'Create'}
                </button>
                {editing && (
                  <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(EMPTY) }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((u, i) => (
            <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
              animation: `fadeUp 0.3s ${i*0.04}s var(--ease) both` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                {u.name?.[0] || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{u.name || '(no name)'}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{u.email}</p>
              </div>
              <span className={`badge badge-${u.role}`}>{u.role}</span>
              <select className="input" value={u.role} style={{ width: 'auto', fontSize: 13, padding: '6px 10px' }}
                onChange={e => api.put(`/api/admin/users/${u.id}/role`, { role: e.target.value }).then(load)}>
                <option value="customer">Customer</option>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Sales */}
      {tab === 'sales' && (
        <div className="card fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 17 }}>Revenue over time</h3>
            <button className="btn btn-outline btn-sm" onClick={() => api.download('/api/orders/export')}>Download CSV</button>
          </div>
          {sales.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <p className="t-headline" style={{ marginBottom: 8 }}>No sales data yet</p>
              <p className="t-caption">Complete some orders to see the chart</p>
            </div>
          ) : (
            <Line data={chartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#6E6E73', fontSize: 12 } },
                y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { color: '#6E6E73', callback: v => `$${v}` } }
              }
            }} />
          )}
        </div>
      )}
    </div>
  )
}
