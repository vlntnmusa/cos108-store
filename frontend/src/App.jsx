import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import StorefrontPage   from './pages/StorefrontPage'
import ProductDetail    from './pages/ProductDetailPage'
import CartPage         from './pages/CartPage'
import LoginPage        from './pages/LoginPage'
import OrderHistory     from './pages/OrderHistoryPage'
import AdminDashboard   from './pages/AdminDashboard'
import POSPage          from './pages/POSPage'
import CheckoutPage     from './pages/CheckoutPage'

function useCart() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] }
  })
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)) }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty      = (id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const clearCart      = () => setCart([])

  return { cart, addToCart, removeFromCart, updateQty, clearCart }
}

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])
  return [darkMode, () => setDarkMode(d => !d)]
}

export default function App() {
  const { cart, addToCart, removeFromCart, updateQty, clearCart } = useCart()
  const [darkMode, toggleDark] = useDarkMode()

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar cartCount={cart.reduce((s, i) => s + i.qty, 0)} darkMode={darkMode} toggleDark={toggleDark} />
        <Routes>
          <Route path="/"            element={<StorefrontPage addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/cart"        element={<CartPage cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} clearCart={clearCart} />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/checkout"    element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
          <Route path="/orders"      element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/admin"       element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/pos"         element={<ProtectedRoute roles={['admin','cashier']}><POSPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
