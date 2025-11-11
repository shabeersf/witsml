'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Gauge, Droplet, Thermometer, Zap, TrendingUp, Upload, Play, Pause, RotateCcw, FastForward, Link as LinkIcon, X } from 'lucide-react'
import Link from 'next/link'

// Static drilling data (default)
const defaultDrillingData = {
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
  const [drillingData, setDrillingData] = useState(defaultDrillingData)
  const [simulationData, setSimulationData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const fileInputRef = useRef(null)
  const playbackIntervalRef = useRef(null)

  // Time series data for charts
  const [depthData, setDepthData] = useState(Array.from({ length: 50 }, (_, i) => ({
    time: i,
    depth: 6400 + (i * 0.92),
    rop: 30 + Math.random() * 15
  })))

  const [torqueData, setTorqueData] = useState(Array.from({ length: 50 }, (_, i) => ({
    time: i,
    torque: 6800 + Math.random() * 400,
    speed: 95 + Math.random() * 10
  })))

  const [mudData, setMudData] = useState(Array.from({ length: 50 }, (_, i) => ({
    time: i,
    flowIn: 290 + Math.random() * 25,
    flowOut: 38 + Math.random() * 10,
    pressure: 3100 + Math.random() * 100
  })))

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isPlaying && simulationData && simulationData.data.length > 0) {
      const interval = (simulationData.metadata?.timeInterval || 1) * 1000 / playbackSpeed
      
      playbackIntervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = prevIndex + 1
          if (nextIndex >= simulationData.data.length) {
            setIsPlaying(false)
            return prevIndex
          }
          
          const point = simulationData.data[nextIndex]
          updateDisplayData(point)
          return nextIndex
        })
      }, interval)

      return () => {
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current)
        }
      }
    }
  }, [isPlaying, simulationData, playbackSpeed, currentIndex])

  const updateDisplayData = (point) => {
    setDrillingData({
      bitDepth: point.bitDepth || point.DBTM || 0,
      holeDepth: point.holeDepth || point.DMEA || 0,
      hookLoad: point.hookLoad || point.HOOKLOAD || 0,
      blockPosition: point.blockPosition || point.BLOCKPOSITION || 0,
      weightOnBit: point.weightOnBit || point.WEIGHTONBIT || 0,
      rop: point.rop || point.ROP || 0,
      rotarySpeed: point.rotarySpeed || point.ROTARYSPEED || 0,
      torque: point.torque || point.TORQUE || 0,
      mudFlowIn: point.mudFlowIn || point.MUDFLOWIN || 0,
      pumpPressure: point.pumpPressure || point.PUMPPRESSURE || 0,
      stroke1: point.stroke1 || point.STROKE1 || 0,
      stroke2: point.stroke2 || point.STROKE2 || 0,
      stroke3: point.stroke3 || point.STROKE3 || 0,
      mudFlowOut: point.mudFlowOut || point.MUDFLOWOUT || 0,
      tempIn: point.tempIn || point.TEMPIN || 0,
      tempOut: point.tempOut || point.TEMPOUT || 0,
    })

    // Update history for charts
    setHistoryData(prev => {
      const newHistory = [...prev, {
        time: prev.length,
        depth: point.bitDepth || point.DBTM || 0,
        rop: point.rop || point.ROP || 0,
        torque: point.torque || point.TORQUE || 0,
        speed: point.rotarySpeed || point.ROTARYSPEED || 0,
        flowIn: point.mudFlowIn || point.MUDFLOWIN || 0,
        flowOut: point.mudFlowOut || point.MUDFLOWOUT || 0,
        pressure: point.pumpPressure || point.PUMPPRESSURE || 0,
      }]
      
      // Keep last 50 points
      return newHistory.slice(-50)
    })
  }

  const parseXML = (xmlString) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    
    const points = xmlDoc.getElementsByTagName('Point')
    const data = []
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      const dataPoint = {}
      
      for (let j = 0; j < point.children.length; j++) {
        const child = point.children[j]
        const tagName = child.tagName
        const value = parseFloat(child.textContent) || child.textContent
        dataPoint[tagName] = value
      }
      
      data.push(dataPoint)
    }
    
    return { data, metadata: { timeInterval: 1 } }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target.result
        let parsedData

        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(content)
        } else if (file.name.endsWith('.xml')) {
          parsedData = parseXML(content)
        } else {
          alert('Unsupported file format. Please upload JSON or XML file.')
          return
        }

        setSimulationData(parsedData)
        setCurrentIndex(0)
        setHistoryData([])
        setShowUploadModal(false)
        
        // Set first data point
        if (parsedData.data && parsedData.data.length > 0) {
          updateDisplayData(parsedData.data[0])
        }
      } catch (error) {
        console.error('Error parsing file:', error)
        alert('Error parsing file. Please check the file format.')
      }
    }

    reader.readAsText(file)
  }

  const handlePlayPause = () => {
    if (!simulationData || simulationData.data.length === 0) {
      alert('Please upload simulation data first')
      return
    }
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
    setHistoryData([])
    if (simulationData && simulationData.data.length > 0) {
      updateDisplayData(simulationData.data[0])
    }
  }

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 2, 5, 10]
    const currentSpeedIndex = speeds.indexOf(playbackSpeed)
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length
    setPlaybackSpeed(speeds[nextSpeedIndex])
  }

  const displayDepthData = historyData.length > 0 ? historyData : depthData
  const displayTorqueData = historyData.length > 0 ? historyData : torqueData
  const displayMudData = historyData.length > 0 ? historyData : mudData

  const progress = simulationData && simulationData.data.length > 0 
    ? (currentIndex / (simulationData.data.length - 1)) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 mb-4">
          {/* Top row: Logo and Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gauge className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Drilling Surface Parameters
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">Real-time Monitoring System</p>
              </div>
            </div>
            {/* Time display - hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block text-right">
              <div className="text-2xl font-mono text-cyan-400">{time.toLocaleTimeString()}</div>
              <div className="text-sm text-slate-500">{time.toLocaleDateString()}</div>
            </div>
          </div>
          
          {/* Bottom row: Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link 
              href="/generate"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Generate Data</span>
              <span className="sm:hidden">Generate</span>
            </Link>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Upload Data</span>
              <span className="sm:hidden">Upload</span>
            </button>
            {/* Time display for mobile/tablet */}
            <div className="lg:hidden ml-auto text-right">
              <div className="text-lg sm:text-xl font-mono text-cyan-400">{time.toLocaleTimeString()}</div>
              <div className="text-xs sm:text-sm text-slate-500">{time.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"></div>
      </motion.header>

      {/* Playback Controls */}
      {simulationData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-3 sm:p-4"
        >
          <div className="flex flex-col gap-4">
            {/* Controls row */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePlayPause}
                  className={`p-2 sm:p-3 rounded-lg ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 sm:p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleSpeedChange}
                  className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
                  {playbackSpeed}x
                </button>
              </div>
              
              {/* Status info - shown on mobile */}
              <div className="text-right lg:hidden">
                <div className="text-xs sm:text-sm text-slate-400">Simulation Active</div>
                <div className="text-sm sm:text-base font-semibold text-green-400">
                  {simulationData.data.length} points
                </div>
              </div>
            </div>
            
            {/* Progress bar section */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 mb-2">
                  <span>Point {currentIndex + 1} / {simulationData.data.length}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Status info - hidden on mobile, shown on desktop */}
              <div className="hidden lg:block text-right flex-shrink-0">
                <div className="text-sm text-slate-400">Simulation Active</div>
                <div className="text-lg font-semibold text-green-400">
                  {simulationData.data.length} data points
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Upload Simulation Data</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300"
              >
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-300 mb-2 text-sm sm:text-base">Click to upload file</p>
                <p className="text-xs sm:text-sm text-slate-500">Supports XML and JSON formats</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-xs sm:text-sm text-slate-300">
                  Upload a WITSML XML or JSON file generated from the data generator to simulate real-time drilling operations.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-cyan-400">Bit Depth</h2>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{drillingData.bitDepth.toFixed(2)}</div>
          <div className="text-slate-400 text-sm sm:text-base">meters</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-blue-400">Hole Depth</h2>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{drillingData.holeDepth.toFixed(2)}</div>
          <div className="text-slate-400 text-sm sm:text-base">meters</div>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard icon={Gauge} label="Hook Load" value={drillingData.hookLoad.toFixed(2)} unit="kips" color="from-cyan-500 to-blue-500" delay={0.1} />
        <MetricCard icon={Activity} label="Block Position" value={drillingData.blockPosition.toFixed(2)} unit="ft" color="from-blue-500 to-purple-500" delay={0.15} />
        <MetricCard icon={Zap} label="Weight on Bit" value={drillingData.weightOnBit.toFixed(2)} unit="klbs" color="from-purple-500 to-pink-500" delay={0.2} />
        <MetricCard icon={TrendingUp} label="ROP" value={drillingData.rop.toFixed(2)} unit="ft/hr" color="from-pink-500 to-red-500" delay={0.25} />
        <MetricCard icon={Activity} label="Rotary Speed" value={drillingData.rotarySpeed.toFixed(2)} unit="rpm" color="from-red-500 to-orange-500" delay={0.3} />
        <MetricCard icon={Gauge} label="Torque" value={drillingData.torque.toFixed(2)} unit="ft-lbs" color="from-orange-500 to-yellow-500" delay={0.35} />
        <MetricCard icon={Droplet} label="Mud Flow In" value={drillingData.mudFlowIn.toFixed(2)} unit="gal/min" color="from-green-500 to-emerald-500" delay={0.4} />
        <MetricCard icon={Gauge} label="Pump Pressure" value={drillingData.pumpPressure.toFixed(2)} unit="psi" color="from-emerald-500 to-teal-500" delay={0.45} />
        <MetricCard icon={Activity} label="Stroke 1" value={drillingData.stroke1.toFixed(2)} unit="spm" color="from-teal-500 to-cyan-500" delay={0.5} />
        <MetricCard icon={Activity} label="Stroke 2" value={drillingData.stroke2.toFixed(2)} unit="spm" color="from-cyan-500 to-blue-500" delay={0.55} />
        <MetricCard icon={Droplet} label="Mud Flow Out" value={drillingData.mudFlowOut.toFixed(2)} unit="gal/min" color="from-blue-500 to-indigo-500" delay={0.6} />
        <MetricCard icon={Thermometer} label="Temp Δ" value={(drillingData.tempOut - drillingData.tempIn).toFixed(2)} unit="°F" color="from-indigo-500 to-purple-500" delay={0.65} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Depth & Rate of Penetration" delay={0.7}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={displayDepthData}>
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
            <LineChart data={displayTorqueData}>
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
            <AreaChart data={displayMudData}>
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
            <LineChart data={displayMudData}>
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