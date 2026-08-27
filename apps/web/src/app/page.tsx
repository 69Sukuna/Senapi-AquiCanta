'use client';

import { useEffect, useState } from 'react';
import { 
  Server, 
  Database, 
  Layers, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Box,
  CloudUpload
} from 'lucide-react';

interface ApiHealth {
  status: string;
  service: string;
  timestamp: string;
  database: {
    status: string;
    totalUsers: number;
  };
}

export default function Home() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con la API de NestJS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <main className="container">
      {/* Header */}
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <span className="badge badge-gold">
            <span className="pulse-dot" /> Turborepo + Bun + Docker Monorepo
          </span>
        </div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.75rem'
        }}>
          Aqui Canta Bolivia
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto' }}>
          Infraestructura lista para desarrollo y producción en Railway con NestJS, Next.js 15, PostgreSQL y Prisma.
        </p>
      </header>

      {/* Grid de Estado de Servicios */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '2.5rem' 
      }}>
        {/* Frontend Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'rgba(56, 189, 248, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent-blue)' 
            }}>
              <Layers size={22} />
            </div>
            <span className="badge badge-blue">Puerto 3000</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Web Frontend</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Next.js 15 (App Router) optimizado con salida <code>standalone</code> para Docker.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} /> En línea (Activo)
          </div>
        </div>

        {/* Backend Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'rgba(245, 158, 11, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent-gold)' 
            }}>
              <Server size={22} />
            </div>
            <span className="badge badge-gold">Puerto 4000</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Backend API</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            NestJS 11 con validaciones globales, Swagger y CORS configurado.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {loading ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Verificando...</span>
            ) : health?.status === 'ok' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> API Conectada
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error || 'Desconectada'}
              </div>
            )}
            <a 
              href="http://localhost:4000/docs" 
              target="_blank" 
              rel="noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Swagger <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Database Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'rgba(168, 85, 247, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--accent-purple)' 
            }}>
              <Database size={22} />
            </div>
            <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              Puerto 5432
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>PostgreSQL & Prisma</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Módulo compartido <code>@repo/database</code> con modelos listos.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            {health?.database.status === 'connected' ? (
              <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> PostgreSQL Conectado ({health.database.totalUsers} usuarios)
              </span>
            ) : (
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} /> Esperando conexión en puerto 5432
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Comandos Rápidos & Railway */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Comandos */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Terminal style={{ color: 'var(--accent-gold)' }} size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Comandos Rápidos</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}># Iniciar en desarrollo local:</span>
              <div style={{ color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.25rem' }}>bun run dev</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}># Levantar base de datos en Docker:</span>
              <div style={{ color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.25rem' }}>docker compose up -d postgres</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}># Sincronizar esquema Prisma:</span>
              <div style={{ color: '#38bdf8', fontFamily: 'monospace', marginTop: '0.25rem' }}>bun run db:push</div>
            </div>
          </div>
        </div>

        {/* Railway & Deployment Ready */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <CloudUpload style={{ color: 'var(--accent-blue)' }} size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Listo para Despliegue en Railway</h3>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            Este proyecto cuenta con <strong>Dockerfiles multi-stage</strong> optimizados con <code>turbo prune</code> para cada servicio:
          </p>

          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Servicio 1 (Database):</strong> PostgreSQL Plugin oficial de Railway.</li>
            <li><strong>Servicio 2 (API):</strong> Construcción con <code>apps/api/Dockerfile</code>.</li>
            <li><strong>Servicio 3 (Web):</strong> Construcción con <code>apps/web/Dockerfile</code>.</li>
          </ul>

          <div style={{ marginTop: '1.5rem' }}>
            <button 
              onClick={checkApiHealth}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              <RefreshCw size={16} className={loading ? 'pulse-dot' : ''} /> Refrescar Estado
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
