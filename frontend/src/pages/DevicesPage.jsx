import React, { useEffect, useState } from 'react'
import { Search, ChevronRight, Smartphone, AlertTriangle, Wrench } from 'lucide-react'
import mockApi from '../services/mockApi'

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    mockApi.searchDevices().then(res => {
      setDevices(res.data)
      setLoading(false)
    })
  }, [])

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-heading mb-2">Device Database</h1>
        <p className="text-slate-400">Browse {devices.length} analyzed devices and their failure patterns</p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search for your broken device... (e.g., iPhone, Samsung, MacBook)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-bar pl-12"
          />
        </div>
        {search && (
          <p className="text-sm text-slate-400 mt-2">
            Found {filtered.length} device{filtered.length !== 1 ? 's' : ''} matching "{search}"
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading device database...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto mb-4 text-orange-400" size={48} />
          <p className="text-slate-400 text-lg">No devices found matching "{search}"</p>
          <p className="text-slate-500 text-sm mt-2">Try searching for a different device name or manufacturer</p>
        </div>
      )}

      {!loading && (
        <div className="mt-12 impact-banner">
          <div className="relative z-10 text-center">
            <h3 className="text-xl font-bold text-slate-200 mb-2">Repair Intelligence Database</h3>
            <p className="text-slate-400">
              Our AI has analyzed <span className="text-orange-400 font-semibold">{devices.length}</span> unique device types,
              identifying common failure points and root causes to help repair technicians diagnose issues faster.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function DeviceCard({ device }) {
  const getCategoryIcon = (category) => {
    if (category?.toLowerCase().includes('phone') || category?.toLowerCase().includes('smartphone')) {
      return <Smartphone className="text-blue-400" size={24} />
    }
    return <Wrench className="text-orange-400" size={24} />
  }

  const getSeverityColor = (count) => {
    if (count > 40) return 'text-red-400'
    if (count > 25) return 'text-orange-400'
    if (count > 15) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="device-card group">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-3 bg-slate-800/50 rounded-lg group-hover:bg-slate-700/50 transition-colors">
          {getCategoryIcon(device.category)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200 group-hover:text-orange-400 transition-colors mb-1">
            {device.name}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">
              {device.manufacturer} • {device.category}
            </span>
            <span className={`font-semibold ${getSeverityColor(device.failure_count)}`}>
              {device.failure_count} failure reports
            </span>
          </div>
        </div>
      </div>
      <ChevronRight 
        className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" 
        size={24} 
      />
    </div>
  )
}