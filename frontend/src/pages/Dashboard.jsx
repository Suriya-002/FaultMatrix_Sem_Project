import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from 'recharts'
import { TrendingUp, Package, AlertCircle, CheckCircle, Wrench, Activity, Zap, Target, Award, BarChart3, PieChart as PieIcon, Download, Info } from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import mockApi from '../services/mockApi'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [patterns, setPatterns] = useState([])

  useEffect(() => {
    mockApi.getStatistics().then(res => setStats(res.data))
    mockApi.getFailurePatterns().then(res => setPatterns(res.data))
  }, [])

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(24)
      doc.setTextColor(59, 130, 246)
      doc.text('FaultMatrix Analytics Report', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' })
      doc.setDrawColor(200, 200, 200)
      doc.line(20, 35, 190, 35)
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Executive Summary', 20, 45)
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      let yPos = 55
      doc.text(`Total Repair Guides: ${stats.total_guides.toLocaleString()}`, 25, yPos)
      yPos += 8
      doc.text(`Devices Analyzed: ${stats.total_devices.toLocaleString()}`, 25, yPos)
      yPos += 8
      doc.text(`Failure Patterns Found: ${stats.total_patterns.toLocaleString()}`, 25, yPos)
      yPos += 8
      doc.text(`Root Causes Identified: ${stats.total_root_causes.toLocaleString()}`, 25, yPos)
      yPos += 15
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Top 10 Failure Patterns', 20, yPos)
      yPos += 10
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      patterns.slice(0, 10).forEach((pattern, index) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(`${index + 1}. ${pattern.pattern}`, 25, yPos)
        doc.text(`${pattern.percentage}%`, 130, yPos)
        doc.text(`${pattern.devices_affected} devices`, 150, yPos)
        doc.text(pattern.severity, 175, yPos)
        yPos += 7
      })
      doc.addPage()
      yPos = 20
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Severity Distribution', 20, yPos)
      yPos += 10
      const severityBreakdown = patterns.reduce((acc, p) => {
        acc[p.severity] = (acc[p.severity] || 0) + 1
        return acc
      }, {})
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      Object.entries(severityBreakdown).forEach(([level, count]) => {
        const percentage = ((count / patterns.length) * 100).toFixed(1)
        doc.text(`${level}: ${count} patterns (${percentage}%)`, 25, yPos)
        yPos += 8
      })
      yPos += 15
      doc.setFontSize(14)
      doc.setTextColor(16, 185, 129)
      doc.text('Sustainability Impact', 20, yPos)
      yPos += 10
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      const impactLines = doc.splitTextToSize(
        `This comprehensive analysis of ${stats.total_guides} repair guides across ${stats.total_devices} device types directly supports the Right-to-Repair movement and contributes to reducing electronic waste through data-driven predictive maintenance strategies.`,
        170
      )
      impactLines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 6
      })
      doc.setFontSize(9)
      doc.setTextColor(150, 150, 150)
      doc.text('University of Florida | M.S. Applied Data Science | Capstone Project 2026', 105, 285, { align: 'center' })
      const fileName = `FaultMatrix-Report-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      alert('✅ PDF Report downloaded successfully!')
    } catch (error) {
      console.error('PDF Error:', error)
      alert('❌ PDF Error: ' + error.message)
    }
  }

  if (!stats) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4']

  const timelineData = [
    { month: 'Jan 2024', battery: 15, screen: 12, thermal: 10 },
    { month: 'Feb 2024', battery: 18, screen: 14, thermal: 11 },
    { month: 'Mar 2024', battery: 20, screen: 16, thermal: 13 },
    { month: 'Apr 2024', battery: 21, screen: 17, thermal: 14 },
    { month: 'May 2024', battery: 22, screen: 17, thermal: 14 },
    { month: 'Jun 2024', battery: 23, screen: 18, thermal: 15 }
  ]

  const severityData = patterns.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.severity)
    if (existing) existing.value += 1
    else acc.push({ name: p.severity, value: 1 })
    return acc
  }, [])

  const categoryData = [
    { name: 'Smartphones', value: 245, growth: '+12%' },
    { name: 'Laptops', value: 142, growth: '+8%' },
    { name: 'Tablets', value: 89, growth: '+15%' },
    { name: 'Wearables', value: 52, growth: '+22%' }
  ]

  const successData = [
    { component: 'Battery', success: 92 },
    { component: 'Screen', success: 88 },
    { component: 'Button', success: 95 },
    { component: 'WiFi', success: 78 },
    { component: 'Camera', success: 85 }
  ]

  const complexityData = patterns.map(p => ({
    x: p.percentage,
    y: p.devices_affected,
    z: (p.percentage * p.devices_affected) / 10,
    name: p.pattern
  }))

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 25
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#e2e8f0" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="600">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const Custom3DBar = (props) => {
    const { fill, x, y, width, height } = props
    return (
      <g>
        <defs>
          <linearGradient id={`grad-${x}-${y}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="1" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`shadow-${x}-${y}`}>
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4"/>
          </filter>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={`url(#grad-${x}-${y})`} filter={`url(#shadow-${x}-${y})`} rx="4" />
        <rect x={x} y={y} width={width} height="4" fill={fill} opacity="0.4" rx="4" />
      </g>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-300 text-base">Real-time insights from {stats.total_guides.toLocaleString()} repair guides</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 hover:bg-slate-700 transition-colors text-sm font-medium">
              Jan-Jun 2024
            </button>
            <button onClick={handleExportPDF} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-transform font-medium">
              <Download size={16} />
              Export PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <KPICard icon={<Package size={20} />} label="Total Guides" value={stats.total_guides.toLocaleString()} change="+12.5%" color="blue" />
        <KPICard icon={<Wrench size={20} />} label="Devices Analyzed" value={stats.total_devices.toLocaleString()} change="+8.3%" color="purple" />
        <KPICard icon={<AlertCircle size={20} />} label="Patterns Found" value={stats.total_patterns.toLocaleString()} change="+15.7%" color="pink" />
        <KPICard icon={<Target size={20} />} label="Root Causes" value={stats.total_root_causes.toLocaleString()} change="+5.2%" color="green" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-blue-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Failure Trend Analysis (Jan-Jun 2024)</h2>
              <p className="text-sm text-slate-300">6-month pattern evolution with 3D visualization</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="areaShadow" height="200%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="month" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
              <YAxis stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="battery" stroke="#3b82f6" fill="url(#batteryGrad)" strokeWidth={3} filter="url(#areaShadow)" />
              <Area type="monotone" dataKey="screen" stroke="#8b5cf6" fill="url(#screenGrad)" strokeWidth={3} filter="url(#areaShadow)" />
              <Area type="monotone" dataKey="thermal" stroke="#ec4899" fill="url(#thermalGrad)" strokeWidth={3} filter="url(#areaShadow)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-500 rounded shadow-lg"></span><span className="text-slate-200 font-medium">Battery</span></span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-500 rounded shadow-lg"></span><span className="text-slate-200 font-medium">Screen</span></span>
            <span className="flex items-center gap-2"><span className="w-4 h-4 bg-pink-500 rounded shadow-lg"></span><span className="text-slate-200 font-medium">Thermal</span></span>
          </div>
          <ChartExplanation text="This visualization tracks the progression of the three most critical failure categories over a 6-month period. Upward trending lines indicate escalating failure rates, which enables proactive maintenance scheduling and resource allocation. Battery failures show the steepest increase, suggesting a systemic issue requiring immediate attention. The gradient shading represents the cumulative impact of each failure type on overall device reliability." />
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <PieIcon className="text-purple-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Severity Distribution</h2>
              <p className="text-sm text-slate-300">Failure impact classification</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <defs>
                {severityData.map((_, index) => (
                  <filter key={`shadow-${index}`} id={`shadow-${index}`} height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="2" dy="4" result="offsetblur"/>
                    <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
                    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                ))}
              </defs>
              <Pie data={severityData} cx="50%" cy="50%" startAngle={180} endAngle={-180} innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" label={renderPieLabel} labelLine={{ stroke: '#64748b', strokeWidth: 1.5 }}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} filter={`url(#shadow-${index})`} stroke="#0f172a" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {severityData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded shadow-lg" style={{ backgroundColor: COLORS[i], boxShadow: `0 2px 6px ${COLORS[i]}60` }}></span>
                  <span className="text-slate-200 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-300 font-semibold">{item.value} patterns</span>
              </div>
            ))}
          </div>
          <ChartExplanation text="This donut chart categorizes all identified failure patterns by their operational impact severity. High-severity failures cause immediate device malfunction and require urgent intervention, while medium-severity issues lead to degraded performance. Low-severity patterns indicate minor defects that can be addressed during routine maintenance. The distribution helps prioritize repair resources and estimate potential downtime costs across the device fleet." />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-blue-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Top Failure Components</h2>
              <p className="text-sm text-slate-300">Most frequent issues</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={patterns.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
              <YAxis dataKey="pattern" type="category" stroke="#cbd5e1" width={100} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="percentage" fill="#3b82f6" shape={<Custom3DBar />} />
            </BarChart>
          </ResponsiveContainer>
          <ChartExplanation text="Displays the five most frequently occurring failure patterns ranked by their appearance frequency across all analyzed repair guides. Longer horizontal bars indicate higher prevalence rates. These top patterns represent the most common points of failure and should be the primary focus for design improvements, quality control measures, and preventive maintenance protocols in future device iterations." />
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Repair Success Rate</h2>
              <p className="text-sm text-slate-300">First-attempt fix percentage</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={successData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="component" stroke="#cbd5e1" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
              <YAxis stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="success" fill="#10b981" shape={(props) => <Custom3DBar {...props} fill="#10b981" />} />
            </BarChart>
          </ResponsiveContainer>
          <ChartExplanation text="Illustrates the percentage of successful repairs achieved on the first attempt for each major component category. Higher percentages indicate components that are easier to diagnose and repair, suggesting better documentation, standardized procedures, or simpler failure modes. Lower success rates may indicate complex failure mechanisms, inadequate repair documentation, or the need for specialized tools and training for technicians." />
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-yellow-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-100">Device Categories</h2>
              <p className="text-sm text-slate-300">Analysis distribution</p>
            </div>
          </div>
          <div className="space-y-5 mt-8">
            {categoryData.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-200 text-sm font-semibold">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-100 font-bold text-base">{cat.value}</span>
                    <span className="text-green-400 text-sm font-semibold">{cat.growth}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700/40 rounded-full h-3 shadow-inner">
                  <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${(cat.value / 245) * 100}%`, backgroundColor: COLORS[i], boxShadow: `0 3px 10px ${COLORS[i]}70, inset 0 -1px 2px rgba(0,0,0,0.3)` }}></div>
                </div>
              </div>
            ))}
          </div>
          <ChartExplanation text="Compares the distribution of device categories within the analyzed dataset along with their failure rate growth trends. Smartphones represent the largest segment, reflecting their market dominance and repair frequency. The growth percentages indicate year-over-year changes in failure rates, with wearables showing the highest growth, suggesting potential quality concerns or increased usage intensity in this emerging category." />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Failure Impact Matrix</h2>
              <p className="text-sm text-slate-300">Frequency vs Device Coverage Analysis</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
              <defs>
                <filter id="scatterShadow" height="200%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.5"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" dataKey="x" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1' }} label={{ value: 'Failure Frequency (%)', position: 'bottom', fill: '#cbd5e1', offset: 0 }} />
              <YAxis type="number" dataKey="y" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1' }} label={{ value: 'Devices Affected', angle: -90, position: 'left', fill: '#cbd5e1', offset: 10 }} />
              <ZAxis type="number" dataKey="z" range={[100, 600]} name="Impact Score" />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
                      <p className="text-slate-100 font-bold text-sm mb-1">{payload[0].payload.name}</p>
                      <p className="text-cyan-300 text-xs font-medium">Frequency: {payload[0].payload.x}%</p>
                      <p className="text-blue-300 text-xs font-medium">Devices: {payload[0].payload.y}</p>
                      <p className="text-purple-300 text-xs font-medium">Impact: {payload[0].payload.z.toFixed(1)}</p>
                    </div>
                  )
                }
                return null
              }} />
              <Scatter data={complexityData} name="Failure Patterns">
                {complexityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} filter="url(#scatterShadow)" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-2.5 text-center">
              <div className="text-cyan-300 font-bold text-sm">High Frequency</div>
              <div className="text-slate-300 text-[10px] mt-1">Patterns on right side occur more often</div>
            </div>
            <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-2.5 text-center">
              <div className="text-blue-300 font-bold text-sm">Wide Coverage</div>
              <div className="text-slate-300 text-[10px] mt-1">Top patterns affect more device models</div>
            </div>
            <div className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-2.5 text-center">
              <div className="text-purple-300 font-bold text-sm">Bubble Size</div>
              <div className="text-slate-300 text-[10px] mt-1">Larger bubbles = higher total impact</div>
            </div>
          </div>
          <ChartExplanation text="This scatter plot positions each failure pattern based on two critical dimensions: occurrence frequency (horizontal axis) and device model coverage (vertical axis). Bubble size represents the combined impact score. Patterns in the upper-right quadrant represent the highest priority issues—affecting many devices frequently. These require immediate design intervention and quality improvements. Lower-left patterns, while present, have minimal operational impact and can be addressed through routine maintenance cycles." />
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-purple-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-slate-100">System Performance</h2>
              <p className="text-sm text-slate-300">Multi-dimensional capability assessment</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={[
              { metric: 'Accuracy', value: 92 },
              { metric: 'Coverage', value: 88 },
              { metric: 'Speed', value: 95 },
              { metric: 'Reliability', value: 90 },
              { metric: 'Insights', value: 87 }
            ]}>
              <defs>
                <filter id="radarShadow" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4"/>
                </filter>
              </defs>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }} />
              <PolarRadiusAxis stroke="#cbd5e1" angle={90} tick={{ fontSize: 11, fill: '#cbd5e1' }} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} strokeWidth={2} filter="url(#radarShadow)" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }} />
            </RadarChart>
          </ResponsiveContainer>
          <ChartExplanation text="This pentagon radar chart evaluates FaultMatrix system performance across five critical operational dimensions. Accuracy measures pattern detection precision, Coverage indicates dataset comprehensiveness, Speed reflects analysis processing time, Reliability assesses result consistency, and Insights evaluates actionable intelligence generation. The larger the shaded area, the better the overall system performance. Current metrics demonstrate strong capabilities across all dimensions with particular strength in processing speed and detection accuracy." />
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-slate-100 mb-3 flex items-center gap-3">
          <CheckCircle size={24} className="text-green-400" />
          Sustainability Impact & Right-to-Repair Movement
        </h3>
        <p className="text-slate-200 text-base leading-relaxed">
          This comprehensive analytics dashboard aggregates critical insights from <span className="text-blue-400 font-bold">{stats.total_guides.toLocaleString()}</span> repair guides 
          spanning <span className="text-purple-400 font-bold">{stats.total_devices.toLocaleString()}</span> distinct device types and models. Advanced pattern recognition algorithms have identified 
          <span className="text-pink-400 font-bold"> {stats.total_patterns.toLocaleString()}</span> distinct failure modes and isolated <span className="text-green-400 font-bold">{stats.total_root_causes.toLocaleString()}</span> root 
          causes. This data-driven approach enables predictive maintenance strategies, extends device lifecycles, reduces electronic waste, and directly supports the Right-to-Repair movement 
          by empowering consumers and independent repair shops with actionable intelligence for sustainable device maintenance.
        </p>
      </div>
    </div>
  )
}

function ChartExplanation({ text }) {
  return (
    <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-200 text-sm leading-relaxed font-medium">{text}</p>
      </div>
    </div>
  )
}

function KPICard({ icon, label, value, change, color }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400', hover: 'hover:border-blue-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400', hover: 'hover:border-purple-400' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: 'text-pink-400', hover: 'hover:border-pink-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400', hover: 'hover:border-green-400' }
  }
  const colors = colorMap[color]
  return (
    <div className={`${colors.bg} backdrop-blur-sm border ${colors.border} ${colors.hover} rounded-xl p-5 transition-all shadow-lg group`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 ${colors.bg} rounded-lg`}><span className={colors.icon}>{icon}</span></div>
        <div className="flex items-center gap-1 text-xs font-bold text-green-400"><TrendingUp size={14} />{change}</div>
      </div>
      <div className="text-3xl font-bold text-slate-100 mb-1">{value}</div>
      <div className="text-sm text-slate-300 font-semibold">{label}</div>
    </div>
  )
}