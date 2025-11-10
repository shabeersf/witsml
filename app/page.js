'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'
import { Activity, Gauge, Droplet, Thermometer, Zap, TrendingUp } from 'lucide-react'

// Static drilling data
const drillingData = {
  bitDepth: 6446.20,
  holeDepth: 6446.20,
  hookLoad: 152.24,
  blockPosition: 25.19,
  weightOnBit: 15.15,
  rop: 36.37,
  rotarySpeed: 99.87,
  torque: 7011.86,
  mudFlowIn: 301.87,
  pumpPressure: 3154.44,
  stroke1: 38.02,
  stroke2: 33.64,
  stroke3: 0.00,
  mudFlowOut: 42.78,
  tempIn: 58.30,
  tempOut: 62.30
}

// Time series data for charts
const depthData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  depth: 6400 + (i * 0.92),
  rop: 30 + Math.random() * 15
}))

const torqueData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  torque: 6800 + Math.random() * 400,
  speed: 95 + Math.random() * 10
}))

const mudData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  flowIn: 290 + Math.random() * 25,
  flowOut: 38 + Math.random() * 10,
  pressure: 3100 + Math.random() * 100
}))

const MetricCard = ({ icon: Icon, label, value, unit, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
    <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color.replace('from-', 'text-').split(' ')[0]}`} />
        <span className="text-xs text-slate-500 font-mono">{unit}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
    </div>
  </motion.div>
)

const ChartCard = ({ title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
  >
    <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5" />
      {title}
    </h3>
    {children}
  </motion.div>
)

export default function DrillingDashboard() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Gauge className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Drilling Surface Parameters
              </h1>
              <p className="text-slate-400 text-sm">Real-time Monitoring System</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-cyan-400">{time.toLocaleTimeString()}</div>
            <div className="text-sm text-slate-500">{time.toLocaleDateString()}</div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"></div>
      </motion.header>

      {/* Depth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-cyan-400">Bit Depth</h2>
          </div>
          <div className="text-5xl font-bold text-white mb-2">{drillingData.bitDepth}</div>
          <div className="text-slate-400">meters</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-blue-400">Hole Depth</h2>
          </div>
          <div className="text-5xl font-bold text-white mb-2">{drillingData.holeDepth}</div>
          <div className="text-slate-400">meters</div>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard icon={Gauge} label="Hook Load" value={drillingData.hookLoad} unit="kips" color="from-cyan-500 to-blue-500" delay={0.1} />
        <MetricCard icon={Activity} label="Block Position" value={drillingData.blockPosition} unit="ft" color="from-blue-500 to-purple-500" delay={0.15} />
        <MetricCard icon={Zap} label="Weight on Bit" value={drillingData.weightOnBit} unit="klbs" color="from-purple-500 to-pink-500" delay={0.2} />
        <MetricCard icon={TrendingUp} label="ROP" value={drillingData.rop} unit="ft/hr" color="from-pink-500 to-red-500" delay={0.25} />
        <MetricCard icon={Activity} label="Rotary Speed" value={drillingData.rotarySpeed} unit="rpm" color="from-red-500 to-orange-500" delay={0.3} />
        <MetricCard icon={Gauge} label="Torque" value={drillingData.torque} unit="ft-lbs" color="from-orange-500 to-yellow-500" delay={0.35} />
        <MetricCard icon={Droplet} label="Mud Flow In" value={drillingData.mudFlowIn} unit="gal/min" color="from-green-500 to-emerald-500" delay={0.4} />
        <MetricCard icon={Gauge} label="Pump Pressure" value={drillingData.pumpPressure} unit="psi" color="from-emerald-500 to-teal-500" delay={0.45} />
        <MetricCard icon={Activity} label="Stroke 1" value={drillingData.stroke1} unit="spm" color="from-teal-500 to-cyan-500" delay={0.5} />
        <MetricCard icon={Activity} label="Stroke 2" value={drillingData.stroke2} unit="spm" color="from-cyan-500 to-blue-500" delay={0.55} />
        <MetricCard icon={Droplet} label="Mud Flow Out" value={drillingData.mudFlowOut} unit="gal/min" color="from-blue-500 to-indigo-500" delay={0.6} />
        <MetricCard icon={Thermometer} label="Temp Δ" value={(drillingData.tempOut - drillingData.tempIn).toFixed(2)} unit="°F" color="from-indigo-500 to-purple-500" delay={0.65} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Depth & Rate of Penetration" delay={0.7}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={depthData}>
              <defs>
                <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Area type="monotone" dataKey="depth" stroke="#06b6d4" fill="url(#depthGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Torque & Rotary Speed" delay={0.75}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={torqueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line type="monotone" dataKey="torque" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="speed" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mud Flow System" delay={0.8}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mudData}>
              <defs>
                <linearGradient id="mudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Area type="monotone" dataKey="flowIn" stroke="#10b981" fill="url(#mudGradient)" strokeWidth={2} />
              <Line type="monotone" dataKey="flowOut" stroke="#f59e0b" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pump Pressure Trend" delay={0.85}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mudData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line type="monotone" dataKey="pressure" stroke="#f43f5e" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center text-slate-500 text-sm"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-4"></div>
        <p>Octopus EYE • WITSML Data Visualization System</p>
      </motion.footer>
    </div>
  )
}