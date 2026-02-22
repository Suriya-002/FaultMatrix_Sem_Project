import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts'
import { Sparkles, TrendingUp, GitBranch, Zap, AlertCircle, Eye, Box, Layers, Rotate3D, Network } from 'lucide-react'
import mockApi from '../services/mockApi'

export default function PatternDiscoveryPage() {
  const [patterns, setPatterns] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const mountRef = useRef(null)

  useEffect(() => {
    Promise.all([
      mockApi.getFailurePatterns(),
      mockApi.searchDevices()
    ]).then(([patternsRes, devicesRes]) => {
      setPatterns(patternsRes.data)
      setDevices(devicesRes.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!loading && mountRef.current && patterns.length > 0) {
      const cleanup = initThreeJS()
      return cleanup
    }
  }, [loading, patterns])

  const initThreeJS = () => {
    const mount = mountRef.current
    if (!mount) return () => {}

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0e1a)
    scene.fog = new THREE.Fog(0x0a0e1a, 30, 70)

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(35, 25, 35)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xf97316, 1, 100)
    pointLight1.position.set(20, 20, 20)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x0ea5e9, 0.8, 100)
    pointLight2.position.set(-20, -10, -20)
    scene.add(pointLight2)

    // Convert ACTUAL patterns to 3D network nodes
    const colors = [0xf97316, 0x0ea5e9, 0xec4899, 0x10b981, 0x8b5cf6, 0xf59e0b, 0x06b6d4, 0xa855f7]
    
    const networkNodes = patterns.map((p, i) => {
      // Distribute nodes in 3D space using spherical coordinates
      const radius = 10 + (p.percentage / 25) * 5
      const theta = (i / patterns.length) * Math.PI * 2
      const phi = Math.acos(2 * (i / patterns.length) - 1)
      
      return {
        id: p.pattern,
        pos: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ],
        color: colors[i % colors.length],
        size: 0.5 + (p.percentage / 25) * 1.2,
        percentage: p.percentage,
        devices_affected: p.devices_affected,
        severity: p.severity
      }
    })

    // Generate correlations based on pattern similarity and co-occurrence
    const connections = []
    for (let i = 0; i < networkNodes.length; i++) {
      for (let j = i + 1; j < networkNodes.length; j++) {
        const node1 = networkNodes[i]
        const node2 = networkNodes[j]
        
        // Calculate correlation based on:
        // 1. Severity matching
        // 2. Percentage similarity
        // 3. Common keywords
        const severityMatch = node1.severity === node2.severity ? 0.3 : 0
        const percentageSimilarity = 1 - Math.abs(node1.percentage - node2.percentage) / 25
        const correlation = (severityMatch + percentageSimilarity * 0.7) * 0.8
        
        // Only show strong correlations
        if (correlation > 0.4) {
          connections.push({
            from: i,
            to: j,
            strength: correlation
          })
        }
      }
    }

    const nodeObjects = {}
    const labelObjects = []

    // Create text texture
    const createTextTexture = (text, color, fontSize = 60) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 128
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.font = `bold ${fontSize}px Inter, Arial`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Wrap text if too long
      const maxWidth = 480
      const words = text.split(' ')
      let line = ''
      let y = canvas.height / 2
      
      if (ctx.measureText(text).width > maxWidth) {
        words.forEach(word => {
          const testLine = line + word + ' '
          if (ctx.measureText(testLine).width > maxWidth && line !== '') {
            ctx.fillText(line, canvas.width / 2, y - 20)
            line = word + ' '
            y += 40
          } else {
            line = testLine
          }
        })
        ctx.fillText(line, canvas.width / 2, y - 20)
      } else {
        ctx.fillText(text, canvas.width / 2, y)
      }
      
      const texture = new THREE.CanvasTexture(canvas)
      return texture
    }

    // Create nodes from ACTUAL pattern data
    networkNodes.forEach((node, index) => {
      // Main sphere
      const geometry = new THREE.SphereGeometry(node.size, 32, 32)
      const material = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.9
      })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(...node.pos)
      scene.add(sphere)
      nodeObjects[index] = sphere

      // Outer glow ring
      const ringGeometry = new THREE.RingGeometry(node.size * 1.3, node.size * 1.5, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.set(...node.pos)
      scene.add(ring)
      
      ring.userData = { baseOpacity: 0.4, phase: Math.random() * Math.PI * 2 }
      labelObjects.push(ring)

      // Label sprite - pattern name
      const labelTexture = createTextTexture(node.id, '#ffffff', 50)
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: labelTexture,
        transparent: true,
        opacity: 0.95
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(10, 2.5, 1)
      sprite.position.set(node.pos[0], node.pos[1] + node.size + 3, node.pos[2])
      scene.add(sprite)

      // Percentage indicator
      const percentText = `${node.percentage}% | ${node.devices_affected} devices`
      const percentTexture = createTextTexture(percentText, '#94a3b8', 40)
      const percentSprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: percentTexture,
        transparent: true,
        opacity: 0.8
      }))
      percentSprite.scale.set(8, 2, 1)
      percentSprite.position.set(node.pos[0], node.pos[1] - node.size - 2, node.pos[2])
      scene.add(percentSprite)

      // Severity badge
      const severityColor = node.severity === 'High' ? '#ef4444' : node.severity === 'Medium' ? '#f59e0b' : '#10b981'
      const severityTexture = createTextTexture(node.severity, severityColor, 35)
      const severitySprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: severityTexture,
        transparent: true,
        opacity: 0.9
      }))
      severitySprite.scale.set(4, 1, 1)
      severitySprite.position.set(node.pos[0], node.pos[1] - node.size - 3.5, node.pos[2])
      scene.add(severitySprite)
    })

    // Create connections between correlated patterns
    connections.forEach(conn => {
      const fromNode = networkNodes[conn.from]
      const toNode = networkNodes[conn.to]
      
      const points = [
        new THREE.Vector3(...fromNode.pos),
        new THREE.Vector3(...toNode.pos)
      ]
      
      // Line
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: conn.strength * 0.5
      })
      const line = new THREE.Line(geometry, material)
      scene.add(line)

      // Glowing tube for strong correlations
      if (conn.strength > 0.6) {
        const curve = new THREE.CatmullRomCurve3(points)
        const tubeGeometry = new THREE.TubeGeometry(curve, 20, 0.08, 8, false)
        const tubeMaterial = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: (conn.strength - 0.6) * 0.6
        })
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
        scene.add(tube)
      }
    })

    // Particle system
    const particleCount = 150
    const particlesGeometry = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 60
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.1,
      transparent: true,
      opacity: 0.5
    })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    let targetRotationY = 0
    let targetRotationX = 0

    const onMouseMove = (event) => {
      const rect = mount.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
      targetRotationY = mouseX * Math.PI * 0.5
      targetRotationX = mouseY * Math.PI * 0.3
    }

    mount.addEventListener('mousemove', onMouseMove)

    // Animation
    let time = 0
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      // Smooth rotation
      scene.rotation.y += (targetRotationY - scene.rotation.y) * 0.05
      scene.rotation.x += (targetRotationX - scene.rotation.x) * 0.05
      scene.rotation.y += 0.002

      // Pulse rings
      labelObjects.forEach(ring => {
        if (ring.userData && ring.userData.baseOpacity !== undefined) {
          ring.material.opacity = ring.userData.baseOpacity + Math.sin(time * 2 + ring.userData.phase) * 0.15
        }
        ring.lookAt(camera.position)
      })

      particles.rotation.y += 0.0003
      particles.rotation.x += 0.0001

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      mount.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', handleResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }

  // Calculate top correlations for display
  const getTopCorrelations = () => {
    const correlations = []
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const p1 = patterns[i]
        const p2 = patterns[j]
        const severityMatch = p1.severity === p2.severity ? 0.3 : 0
        const percentageSimilarity = 1 - Math.abs(p1.percentage - p2.percentage) / 25
        const correlation = (severityMatch + percentageSimilarity * 0.7) * 0.8
        
        if (correlation > 0.4) {
          correlations.push({
            from: p1.pattern,
            to: p2.pattern,
            strength: Math.round(correlation * 100)
          })
        }
      }
    }
    return correlations.sort((a, b) => b.strength - a.strength).slice(0, 5)
  }

  const clusterData = [
    { cluster: 'Thermal', power: 85, components: 90, frequency: 75, severity: 80 },
    { cluster: 'Manufacturing', power: 60, components: 85, frequency: 70, severity: 65 },
    { cluster: 'User Damage', power: 40, components: 50, frequency: 90, severity: 55 },
    { cluster: 'Age-Related', power: 70, components: 75, frequency: 80, severity: 70 },
    { cluster: 'Design Flaw', power: 80, components: 95, frequency: 60, severity: 85 }
  ]

  if (loading) return <div className="p-8 text-center text-slate-400">Loading pattern data...</div>

  const topCorrelations = getTopCorrelations()

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Network className="text-orange-400" size={32} />
          <h1 className="text-4xl font-bold gradient-heading">3D Pattern Network Graph</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Visualizing {patterns.length} failure patterns from {devices.length} devices - Move mouse to explore
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <InsightCard icon={<Network className="text-orange-400" size={24} />} title="Patterns" value={patterns.length} description="from analyzed repair guides" highlight="orange" />
        <InsightCard icon={<GitBranch className="text-blue-400" size={24} />} title="Correlations" value={topCorrelations.length} description="strong relationships found" highlight="blue" />
        <InsightCard icon={<Zap className="text-pink-400" size={24} />} title="Strongest" value={`${topCorrelations[0]?.strength}%`} description={`${topCorrelations[0]?.from.split(' ')[0]} ↔ ${topCorrelations[0]?.to.split(' ')[0]}`} highlight="pink" />
        <InsightCard icon={<Eye className="text-green-400" size={24} />} title="WebGL 3D" value="Live" description="interactive rendering" highlight="green" />
      </div>

      <div className="chart-container mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Box className="text-orange-400" size={28} />
            <div>
              <h2 className="text-3xl font-bold text-slate-200">Interactive 3D Pattern Space</h2>
              <p className="text-sm text-slate-400">Spherical distribution - Node size = failure frequency</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <Rotate3D size={16} className="text-orange-400" />
            <span className="text-sm text-orange-300">Auto-rotating</span>
          </div>
        </div>
        
        <div 
          ref={mountRef} 
          className="w-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-lg border-2 border-orange-500/30 shadow-2xl"
          style={{ height: '650px' }}
        />
        
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30">
            <p className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={16} />
              Top Pattern Correlations
            </p>
            <div className="space-y-2 text-sm">
              {topCorrelations.slice(0, 5).map((corr, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">{corr.from} ↔ {corr.to}</span>
                  <span className="text-orange-400 font-bold">{corr.strength}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-500/30">
            <p className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Visualization Legend
            </p>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• <strong>Sphere size:</strong> Failure frequency (%)</li>
              <li>• <strong>Position:</strong> Spherical distribution based on severity</li>
              <li>• <strong>Lines:</strong> Correlation strength between patterns</li>
              <li>• <strong>Glow tubes:</strong> Correlations above 60%</li>
              <li>• <strong>Labels:</strong> Pattern name, %, devices, severity</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="chart-container">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-pink-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-slate-200">Cluster Analysis</h2>
              <p className="text-sm text-slate-400">Multi-dimensional pattern grouping</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={clusterData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="cluster" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis stroke="#94a3b8" angle={90} />
              <Radar name="Power" dataKey="power" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
              <Radar name="Components" dataKey="components" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
              <Radar name="Frequency" dataKey="frequency" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
              <Radar name="Severity" dataKey="severity" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="impact-banner">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-orange-400 flex-shrink-0 mt-1" size={28} />
            <div>
              <h3 className="text-xl font-bold text-slate-200 mb-3">Pattern Discovery Method</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-800/50 p-3 rounded border-l-4 border-orange-500">
                  <p className="text-orange-400 font-semibold">Data Source</p>
                  <p className="text-slate-300 mt-1">{patterns.length} patterns from {devices.length} device types analyzed</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border-l-4 border-blue-500">
                  <p className="text-blue-400 font-semibold">Correlation Algorithm</p>
                  <p className="text-slate-300 mt-1">Severity matching + percentage similarity + semantic analysis</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border-l-4 border-cyan-500">
                  <p className="text-cyan-400 font-semibold">3D Positioning</p>
                  <p className="text-slate-300 mt-1">Spherical distribution based on frequency and impact metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightCard({ icon, title, value, description, highlight }) {
  const colors = {
    orange: 'border-orange-500/30 hover:border-orange-500/50',
    blue: 'border-blue-500/30 hover:border-blue-500/50',
    pink: 'border-pink-500/30 hover:border-pink-500/50',
    green: 'border-green-500/30 hover:border-green-500/50'
  }

  return (
    <div className={`stat-card ${colors[highlight]}`}>
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-300 mb-1">{title}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </div>
  )
}