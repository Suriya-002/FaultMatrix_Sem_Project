import React from 'react'
import CursorRipple from './components/CursorRipple'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home, Database, MessageSquare, BarChart3, Sparkles } from 'lucide-react'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import DevicesPage from './pages/DevicesPage'
import PatternDiscoveryPage from './pages/PatternDiscoveryPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-2xl font-bold text-cyan-400">FaultMatrix</h1>
            <p className="text-sm text-slate-400 mt-1">Failure Pattern Analysis</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/" icon={<Home size={20} />} label="Home" />
            <NavLink to="/dashboard" icon={<BarChart3 size={20} />} label="Dashboard" />
            <NavLink to="/devices" icon={<Database size={20} />} label="Devices" />`n            <NavLink to="/patterns" icon={<Sparkles size={20} />} label="Pattern Discovery" />
            <NavLink to="/chat" icon={<MessageSquare size={20} />} label="AI Chat" />
          </nav>
          
          <div className="p-4 border-t border-slate-700">
            <div className="text-xs text-slate-500">
              <p>University of Florida</p>
              <p>M.S. Applied Data Science</p>
              <p className="mt-2 text-cyan-400">Capstone Project 2026</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/devices" element={<DevicesPage />} />
          <Route path="/patterns" element={<PatternDiscoveryPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
          <CursorRipple />
      </BrowserRouter>
  )
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default App
