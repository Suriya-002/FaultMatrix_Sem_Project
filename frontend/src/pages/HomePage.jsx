import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Brain, TrendingUp, Wrench, Recycle, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full border border-orange-500/30">
              <span className="text-orange-400 font-semibold">♻️ Supporting Right-to-Repair Movement</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="gradient-heading">FaultMatrix</span>
            </h1>
            
            <p className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">
              Every Device Deserves a Second Chance
            </p>
            
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
              Empowering repair technicians and sustainability advocates through AI-powered failure analysis. 
              We've analyzed <span className="text-orange-400 font-semibold">1,109 real repair guides</span> to 
              help you understand why devices fail and how to fix them.
            </p>

            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary inline-flex items-center gap-3 text-lg relative z-10"
            >
              <Wrench size={24} />
              Explore the Data
              <TrendingUp size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <StatCard
            icon={<Database size={32} className="text-orange-400" />}
            title="1,109 Repair Guides"
            description="Comprehensive analysis of repair documentation from iFixit covering 528 unique devices"
            color="orange"
          />
          <StatCard
            icon={<Brain size={32} className="text-blue-400" />}
            title="AI-Powered Analysis"
            description="GLiNER entity extraction and LLM-powered root cause analysis using AWS Bedrock"
            color="blue"
          />
          <StatCard
            icon={<TrendingUp size={32} className="text-cyan-400" />}
            title="6,765 Patterns"
            description="Hierarchical clustering identifies failure patterns across device families"
            color="cyan"
          />
        </div>
      </div>

      {/* Impact Section */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="impact-banner">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-3">
              <Recycle size={28} />
              Real-World Impact
            </h3>
            <p className="text-slate-300 text-lg mb-4">
              Every repair instead of replacement reduces e-waste and supports sustainable consumption. 
              Our AI analysis helps technicians diagnose issues faster, leading to more successful repairs.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <ImpactMetric 
                icon={<CheckCircle className="text-green-400" />}
                value="528"
                label="Device Types Analyzed"
              />
              <ImpactMetric 
                icon={<CheckCircle className="text-green-400" />}
                value="215"
                label="Root Causes Identified"
              />
              <ImpactMetric 
                icon={<CheckCircle className="text-green-400" />}
                value="6,765"
                label="Repair Patterns Discovered"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-heading">
          How FaultMatrix Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            number="01"
            title="Data Collection"
            description="Automated extraction from 1,109 iFixit repair guides using their API"
            icon="📊"
          />
          <FeatureCard
            number="02"
            title="AI Analysis"
            description="GLiNER extracts components, tools, and failure types. AWS Bedrock identifies root causes"
            icon="🤖"
          />
          <FeatureCard
            number="03"
            title="Pattern Discovery"
            description="Hierarchical clustering reveals common failure patterns across device families"
            icon="🔍"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, description, color }) {
  return (
    <div className="stat-card group">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

function ImpactMetric({ icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function FeatureCard({ number, title, description, icon }) {
  return (
    <div className="stat-card text-center group">
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-orange-400 font-bold text-sm mb-2">STEP {number}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}
