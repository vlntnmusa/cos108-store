import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'

export default function ProductDetailPage({ addToCart }) {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [added, setAdded]     = useState(false)

  useEffect(() => {
    api.get(`/api/products/${id}`).then(setProduct).catch(console.error)
  }, [id])

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (!product) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div className="page">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-2)', marginBottom: 32,
        transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to shop
      </Link>

      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--bg)', aspectRatio: '1', border: '1px solid var(--border-light)' }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, opacity: .3 }}>📦</div>
          }
        </div>

        <div style={{ paddingTop: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 12, lineHeight: 1.15 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 28 }}>
            {product.description}
          </p>
          <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8 }}>
            ${product.price.toFixed(2)}
          </p>
          <p style={{ fontSize: 13, marginBottom: 32,
            color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
            {product.stock > 0 ? `In stock · ${product.stock} available` : 'Out of stock'}
          </p>
          <button
            className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, transition: 'all 0.25s var(--ease)' }}>
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
