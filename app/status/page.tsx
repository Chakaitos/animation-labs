'use client'

import { useEffect, useState } from 'react'

interface HealthCheck {
  name: string
  endpoint: string
  status: 'checking' | 'operational' | 'degraded' | 'down'
  responseTime?: number
  details?: string
  lastCheck?: string
}

export default function StatusPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: 'API Service', endpoint: '/api/health', status: 'checking' },
    { name: 'Database', endpoint: '/api/health/db', status: 'checking' },
    { name: 'Payment System', endpoint: '/api/health/stripe', status: 'checking' },
    { name: 'Video Pipeline', endpoint: '/api/health/n8n', status: 'checking' },
  ])

  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now()
      const updatedChecks = await Promise.all(
        checks.map(async (check) => {
          try {
            const checkStart = Date.now()
            const response = await fetch(check.endpoint)
            const responseTime = Date.now() - checkStart
            const data = await response.json()

            return {
              ...check,
              status: response.ok ? 'operational' : 'degraded',
              responseTime,
              details: data.message || data.error || 'OK',
              lastCheck: new Date().toISOString(),
            } as HealthCheck
          } catch (error) {
            return {
              ...check,
              status: 'down',
              details: error instanceof Error ? error.message : 'Connection failed',
              lastCheck: new Date().toISOString(),
            } as HealthCheck
          }
        })
      )

      setChecks(updatedChecks)
      setLastUpdate(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const allOperational = checks.every((c) => c.status === 'operational')
  const anyDown = checks.some((c) => c.status === 'down')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'status-operational'
      case 'degraded':
        return 'status-degraded'
      case 'down':
        return 'status-down'
      default:
        return 'status-checking'
    }
  }

  const getOverallStatus = () => {
    if (anyDown) return { text: 'SYSTEM DEGRADED', color: 'status-down' }
    if (!allOperational) return { text: 'PARTIAL OUTAGE', color: 'status-degraded' }
    return { text: 'ALL SYSTEMS OPERATIONAL', color: 'status-operational' }
  }

  const overall = getOverallStatus()

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@700;900&display=swap');

        .status-page {
          min-height: 100vh;
          background: #0a0e1a;
          color: #e0e6ed;
          font-family: 'JetBrains Mono', monospace;
          position: relative;
          overflow: hidden;
        }

        /* Scan line effect */
        .status-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 255, 136, 0.02) 50%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1;
          animation: scan 8s linear infinite;
        }

        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(4px);
          }
        }

        /* Grid background */
        .status-page::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .header {
          text-align: center;
          margin-bottom: 4rem;
          padding-top: 2rem;
        }

        .logo {
          font-family: 'Orbitron', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: #00ff88;
          margin-bottom: 3rem;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .overall-status {
          display: inline-block;
          padding: 1.5rem 3rem;
          border: 2px solid;
          border-radius: 2px;
          font-family: 'Orbitron', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          position: relative;
          background: rgba(10, 14, 26, 0.8);
          backdrop-filter: blur(10px);
        }

        .overall-status::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 2px;
          opacity: 0.3;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-operational {
          color: #00ff88;
          border-color: #00ff88;
        }

        .status-operational::before {
          background: #00ff88;
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        }

        .status-degraded {
          color: #ffaa00;
          border-color: #ffaa00;
        }

        .status-degraded::before {
          background: #ffaa00;
          box-shadow: 0 0 40px rgba(255, 170, 0, 0.6);
        }

        .status-down {
          color: #ff3366;
          border-color: #ff3366;
        }

        .status-down::before {
          background: #ff3366;
          box-shadow: 0 0 40px rgba(255, 51, 102, 0.6);
        }

        .status-checking {
          color: #6b7280;
          border-color: #6b7280;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .timestamp {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
          letter-spacing: 0.05em;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 4rem;
        }

        .service-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(100, 116, 139, 0.2);
          border-radius: 4px;
          padding: 2rem;
          position: relative;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .service-card:hover {
          border-color: rgba(0, 255, 136, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .service-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .service-name {
          font-size: 1.125rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .status-indicator.operational {
          background: #00ff88;
          box-shadow: 0 0 12px rgba(0, 255, 136, 0.8);
        }

        .status-indicator.degraded {
          background: #ffaa00;
          box-shadow: 0 0 12px rgba(255, 170, 0, 0.8);
        }

        .status-indicator.down {
          background: #ff3366;
          box-shadow: 0 0 12px rgba(255, 51, 102, 0.8);
        }

        .status-indicator.checking {
          background: #6b7280;
          box-shadow: 0 0 12px rgba(107, 114, 128, 0.8);
        }

        @keyframes pulse-dot {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .service-metrics {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }

        .metric {
          flex: 1;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.25rem;
          font-weight: 500;
          color: #00ff88;
        }

        .metric-value.warning {
          color: #ffaa00;
        }

        .metric-value.error {
          color: #ff3366;
        }

        .status-text {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(100, 116, 139, 0.2);
        }

        .footer {
          text-align: center;
          margin-top: 4rem;
          padding: 2rem;
          font-size: 0.875rem;
          color: #6b7280;
          border-top: 1px solid rgba(100, 116, 139, 0.2);
        }

        .footer a {
          color: #00ff88;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: #00cc6d;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.6);
        }

        @media (max-width: 640px) {
          .overall-status {
            font-size: 1.25rem;
            padding: 1rem 2rem;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="status-page">
        <div className="container">
          <header className="header">
            <div className="logo">Animation Labs</div>
            <div className={`overall-status ${overall.color}`}>{overall.text}</div>
            {lastUpdate && (
              <div className="timestamp">
                LAST CHECK: {lastUpdate} UTC // AUTO-REFRESH: 30s
              </div>
            )}
          </header>

          <div className="services-grid">
            {checks.map((check) => (
              <div key={check.name} className="service-card">
                <div className="service-header">
                  <div className="service-name">{check.name}</div>
                  <div className={`status-indicator ${check.status}`} />
                </div>

                <div className="service-metrics">
                  <div className="metric">
                    <div className="metric-label">Status</div>
                    <div
                      className={`metric-value ${
                        check.status === 'operational'
                          ? ''
                          : check.status === 'degraded'
                            ? 'warning'
                            : 'error'
                      }`}
                    >
                      {check.status.toUpperCase()}
                    </div>
                  </div>
                  {check.responseTime !== undefined && (
                    <div className="metric">
                      <div className="metric-label">Response</div>
                      <div className="metric-value">{check.responseTime}ms</div>
                    </div>
                  )}
                </div>

                {check.details && (
                  <div className="status-text">
                    {check.status === 'operational' ? '✓' : '✗'} {check.details}
                  </div>
                )}
              </div>
            ))}
          </div>

          <footer className="footer">
            <p>
              SYSTEM MONITORING // ANIMATION LABS STATUS DASHBOARD
              <br />
              <a href="/">← Return to Main Site</a>
            </p>
          </footer>
        </div>
      </div>
    </>
  )
}
