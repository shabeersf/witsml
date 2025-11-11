"use client";

import { motion } from "framer-motion";
import {
    AlertCircle,
    Download,
    FileText,
    Settings
} from "lucide-react";
import { useState } from "react";

export default function GeneratePage() {
  const [dataPoints, setDataPoints] = useState(100);
  const [startDepth, setStartDepth] = useState(6400);
  const [endDepth, setEndDepth] = useState(6500);
  const [timeInterval, setTimeInterval] = useState(1); // seconds between readings

  const [parameters, setParameters] = useState([
    {
      id: 1,
      name: "hookLoad",
      label: "Hook Load",
      min: 140,
      max: 160,
      unit: "kips",
      enabled: true,
    },
    {
      id: 2,
      name: "weightOnBit",
      label: "Weight on Bit",
      min: 10,
      max: 20,
      unit: "klbs",
      enabled: true,
    },
    {
      id: 3,
      name: "rop",
      label: "Rate of Penetration",
      min: 25,
      max: 45,
      unit: "ft/hr",
      enabled: true,
    },
    {
      id: 4,
      name: "rotarySpeed",
      label: "Rotary Speed",
      min: 90,
      max: 110,
      unit: "rpm",
      enabled: true,
    },
    {
      id: 5,
      name: "torque",
      label: "Torque",
      min: 6500,
      max: 7500,
      unit: "ft-lbs",
      enabled: true,
    },
    {
      id: 6,
      name: "mudFlowIn",
      label: "Mud Flow In",
      min: 280,
      max: 320,
      unit: "gal/min",
      enabled: true,
    },
    {
      id: 7,
      name: "pumpPressure",
      label: "Pump Pressure",
      min: 3000,
      max: 3300,
      unit: "psi",
      enabled: true,
    },
    {
      id: 8,
      name: "tempIn",
      label: "Temp In",
      min: 55,
      max: 62,
      unit: "°F",
      enabled: true,
    },
    {
      id: 9,
      name: "tempOut",
      label: "Temp Out",
      min: 60,
      max: 68,
      unit: "°F",
      enabled: true,
    },
  ]);

  const updateParameter = (id, field, value) => {
    setParameters(
      parameters.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: field === "enabled" ? value : parseFloat(value) || 0,
            }
          : p
      )
    );
  };

  const generateData = () => {
    const data = [];
    const depthIncrement = (endDepth - startDepth) / dataPoints;
    const startTime = new Date();

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = new Date(startTime.getTime() + i * timeInterval * 1000);
      const depth = startDepth + i * depthIncrement;

      const point = {
        timestamp: timestamp.toISOString(),
        bitDepth: parseFloat(depth.toFixed(2)),
        holeDepth: parseFloat(depth.toFixed(2)),
        blockPosition: parseFloat((20 + Math.random() * 10).toFixed(2)),
        stroke1: parseFloat((35 + Math.random() * 8).toFixed(2)),
        stroke2: parseFloat((30 + Math.random() * 8).toFixed(2)),
        stroke3: 0,
        mudFlowOut: parseFloat((38 + Math.random() * 10).toFixed(2)),
      };

      parameters.forEach((param) => {
        if (param.enabled) {
          const range = param.max - param.min;
          const value = param.min + Math.random() * range;
          point[param.name] = parseFloat(value.toFixed(2));
        }
      });

      data.push(point);
    }

    return data;
  };

  const generateXML = () => {
    const data = generateData();
    const enabledParams = parameters.filter((p) => p.enabled);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<WitsmlData xmlns="http://www.energistics.org/energyml/data/witsmlv2" 
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.energistics.org/energyml/data/witsmlv2 Log.xsd">
  <Log uid="log-${Date.now()}" schemaVersion="2.1">
    <Citation>
      <Title>Simulated Drilling Data</Title>
      <Originator>WITSML Generator</Originator>
      <Creation>${new Date().toISOString()}</Creation>
    </Citation>
    <RunNumber>1</RunNumber>
    <PassNumber>1</PassNumber>
    <LoggingMethod>MWD</LoggingMethod>
    <Wellbore>
      <WellboreName>Simulated Well</WellboreName>
    </Wellbore>
    <ChannelSet uid="channelset-1">
      <Index>
        <IndexKind>date time</IndexKind>
        <Mnemonic>TIME</Mnemonic>
        <Uom>s</Uom>
        <Direction>increasing</Direction>
      </Index>
      <Channels>
        <Channel uid="ch-time">
          <Mnemonic>TIME</Mnemonic>
          <DataKind>date time</DataKind>
          <Uom>s</Uom>
          <ChannelPropertyKind>time</ChannelPropertyKind>
        </Channel>
        <Channel uid="ch-bitdepth">
          <Mnemonic>DBTM</Mnemonic>
          <GlobalMnemonic>Bit Depth</GlobalMnemonic>
          <DataKind>measured depth</DataKind>
          <Uom>m</Uom>
          <ChannelPropertyKind>measured depth</ChannelPropertyKind>
        </Channel>
        <Channel uid="ch-holedepth">
          <Mnemonic>DMEA</Mnemonic>
          <GlobalMnemonic>Hole Depth</GlobalMnemonic>
          <DataKind>measured depth</DataKind>
          <Uom>m</Uom>
          <ChannelPropertyKind>measured depth</ChannelPropertyKind>
        </Channel>
${enabledParams
  .map(
    (param) => `        <Channel uid="ch-${param.name}">
          <Mnemonic>${param.name.toUpperCase()}</Mnemonic>
          <GlobalMnemonic>${param.label}</GlobalMnemonic>
          <DataKind>double</DataKind>
          <Uom>${param.unit}</Uom>
          <ChannelPropertyKind>${param.label}</ChannelPropertyKind>
        </Channel>`
  )
  .join("\n")}
      </Channels>
      <Data>
        <DataPoints count="${data.length}">
${data
  .map(
    (point) => `          <Point>
            <TIME>${point.timestamp}</TIME>
            <DBTM>${point.bitDepth}</DBTM>
            <DMEA>${point.holeDepth}</DMEA>
${enabledParams
  .map(
    (param) =>
      `            <${param.name.toUpperCase()}>${
        point[param.name]
      }</${param.name.toUpperCase()}>`
  )
  .join("\n")}
            <BLOCKPOSITION>${point.blockPosition}</BLOCKPOSITION>
            <STROKE1>${point.stroke1}</STROKE1>
            <STROKE2>${point.stroke2}</STROKE2>
            <STROKE3>${point.stroke3}</STROKE3>
            <MUDFLOWOUT>${point.mudFlowOut}</MUDFLOWOUT>
          </Point>`
  )
  .join("\n")}
        </DataPoints>
      </Data>
    </ChannelSet>
  </Log>
</WitsmlData>`;

    return xml;
  };

  const downloadXML = () => {
    const xml = generateXML();
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `witsml-data-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const data = generateData();
    const json = JSON.stringify(
      {
        metadata: {
          dataPoints,
          startDepth,
          endDepth,
          timeInterval,
          generated: new Date().toISOString(),
        },
        parameters: parameters.filter((p) => p.enabled),
        data,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `witsml-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              WITSML Data Generator
            </h1>
            <p className="text-slate-400 text-sm">
              Configure and generate drilling simulation data
            </p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"></div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 sticky top-6"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Data Points
                </label>
                <input
                  type="number"
                  value={dataPoints}
                  onChange={(e) => setDataPoints(parseInt(e.target.value) || 1)}
                  min="10"
                  max="10000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  10 - 10,000 points
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Depth (m)
                </label>
                <input
                  type="number"
                  value={startDepth}
                  onChange={(e) =>
                    setStartDepth(parseFloat(e.target.value) || 0)
                  }
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Depth (m)
                </label>
                <input
                  type="number"
                  value={endDepth}
                  onChange={(e) => setEndDepth(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Time Interval (seconds)
                </label>
                <input
                  type="number"
                  value={timeInterval}
                  onChange={(e) =>
                    setTimeInterval(parseFloat(e.target.value) || 1)
                  }
                  min="0.1"
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Simulation duration:{" "}
                  {((dataPoints * timeInterval) / 60).toFixed(1)} minutes
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <button
                  onClick={downloadXML}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download XML
                </button>
                <button
                  onClick={downloadJSON}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download JSON
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Parameters Panel */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Parameters Configuration
            </h2>

            <div className="space-y-4">
              {parameters.map((param) => (
                <div
                  key={param.id}
                  className={`bg-slate-800/50 border ${
                    param.enabled ? "border-cyan-500/30" : "border-slate-700"
                  } rounded-lg p-4 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) =>
                          updateParameter(param.id, "enabled", e.target.checked)
                        }
                        className="w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                      />
                      <div>
                        <h3
                          className={`font-semibold ${
                            param.enabled ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {param.label}
                        </h3>
                        <p className="text-xs text-slate-500">{param.unit}</p>
                      </div>
                    </div>
                  </div>

                  {param.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Min Value
                        </label>
                        <input
                          type="number"
                          value={param.min}
                          onChange={(e) =>
                            updateParameter(param.id, "min", e.target.value)
                          }
                          step="0.1"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Max Value
                        </label>
                        <input
                          type="number"
                          value={param.max}
                          onChange={(e) =>
                            updateParameter(param.id, "max", e.target.value)
                          }
                          step="0.1"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-blue-400 mb-1">
                  Usage Instructions
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Configure the depth range and number of data points</li>
                  <li>
                    Enable/disable parameters and set their min/max ranges
                  </li>
                  <li>Download the generated XML or JSON file</li>
                  <li>
                    Go to the main dashboard and upload the file to simulate
                    real-time data
                  </li>
                </ol>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
