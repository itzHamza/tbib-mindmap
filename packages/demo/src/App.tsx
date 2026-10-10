import React, { useState, useRef, useEffect } from 'react';
import {
  Mindmap,
  MindmapController,
  MindmapHandle,
  LayoutType,
  NodeVariant,
} from '@tbib-mindmap-viewer/react';

const SAMPLE_MARKDOWN = `# Insuffisance Cardiaque
## 1. Définition & Physiopathologie
- Baisse du débit cardiaque
- Activation neuro-hormonale (SRAA, SNS)
- Remodelage ventriculaire gauche
## 2. Étiologies principales
- Cardiopathie ischémique (Infarctus)
- Hypertension artérielle (HTA)
- Valvulopathies (Rétrécissement aortique)
- Cardiomyopathies primitives
## 3. Signes Cliniques
- Dyspnée d'effort puis de repos (NYHA I-IV)
- Râles crépitants pulmonaires
- OEdèmes des membres inférieurs (OMI)
- Turgescence jugulaire & Reflux hépato-jugulaire
## 4. Examens Complémentaires
- ECG (Hypertrophie, ischémie)
- Radiographie thoracique (Cardiomégalie)
- BNP / NT-proBNP élevés
- Échocardiographie Doppler (FEVG)
## 5. Prise en Charge Thérapeutique
- Règles hygiéno-diététiques (Régime désodé)
- Inhibiteurs du SRAA (IEC / ARA II / ARNI)
- Bêta-bloquants cardioprotecteurs
- Diurétiques de l'anse en cas de surcharge`;

export default function App() {
  const [content, setContent] = useState(SAMPLE_MARKDOWN);
  const [layout, setLayout] = useState<LayoutType>('Center');
  const [variant, setVariant] = useState<NodeVariant>('filled');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [zoomLevel, setZoomLevel] = useState(1);
  const mindmapRef = useRef<MindmapHandle>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (mindmapRef.current) {
        setZoomLevel(mindmapRef.current.zoomLevel);
      }
    }, 150);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#0b0f19' : '#f1f5f9',
        color: theme === 'dark' ? '#f8fafc' : '#0f172a',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 600 }}>TBiB Mindmap</h1>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>
              Interactive Open Source Mindmap Viewer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Layout Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Layout:</span>
            <button
              onClick={() => setLayout('Horizontal')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: layout === 'Horizontal' ? '#6366f1' : 'transparent',
                color: layout === 'Horizontal' ? '#ffffff' : '#94a3b8',
              }}
            >
              Horizontal
            </button>
            <button
              onClick={() => setLayout('Center')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: layout === 'Center' ? '#6366f1' : 'transparent',
                color: layout === 'Center' ? '#ffffff' : '#94a3b8',
              }}
            >
              Center
            </button>
          </div>

          {/* Variant Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Style:</span>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as NodeVariant)}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
              }}
            >
              <option value="filled">Filled</option>
              <option value="stroke">Stroke</option>
              <option value="glass">Glass</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
              backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Markdown Editor */}
        <div
          style={{
            width: '320px',
            borderRight: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderBottom: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
              color: '#94a3b8',
            }}
          >
            Markdown Input
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              padding: '14px',
              backgroundColor: 'transparent',
              color: 'inherit',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Right: Mindmap Viewer */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Floating Controls Bar */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 30,
            }}
          >
            <MindmapController
              onZoomIn={() => mindmapRef.current?.zoomIn()}
              onZoomOut={() => mindmapRef.current?.zoomOut()}
              onFit={() => mindmapRef.current?.fitScreen()}
              onDownloadSVG={() => mindmapRef.current?.downloadSVG()}
              onExportPDF={() => mindmapRef.current?.exportAsPDF() ?? Promise.resolve()}
              zoomLevel={zoomLevel}
              theme={theme}
            />
          </div>

          <Mindmap
            ref={mindmapRef}
            content={content}
            type={layout}
            nodeVariant={variant}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
