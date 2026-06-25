import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Riders from './pages/Riders'
import Stores from './pages/Stores'
import Orders from './pages/Orders'
import Payouts from './pages/Payouts'
import Metrics from './pages/Metrics'

function Shell({ children }){
  return (
    <div style={{display:'flex', minHeight:'100vh', fontFamily:'Inter, system-ui, sans-serif'}}>
      <nav style={{width:220, padding:20, borderRight:'1px solid #eee'}}>
        <h3>ZaraDrop Admin</h3>
        <ul style={{listStyle:'none', padding:0}}>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/riders">Riders</Link></li>
          <li><Link to="/stores">Stores</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          <li><Link to="/payouts">Payouts</Link></li>
          <li><Link to="/metrics">Metrics</Link></li>
        </ul>
      </nav>
      <main style={{flex:1, padding:20}}>{children}</main>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/riders" element={<Riders/>} />
          <Route path="/stores" element={<Stores/>} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/payouts" element={<Payouts/>} />
          <Route path="/metrics" element={<Metrics/>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
