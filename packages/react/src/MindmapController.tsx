import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileImage,
  FileDown,
  ScanSearch,
  Loader2,
} from 'lucide-react';
import { MindmapControllerProps } from './types';

export const MindmapController: React.FC<MindmapControllerProps> = ({
  onZoomIn,
  onZoomOut,
  onFit,
  onDownloadSVG,
  onExportPDF,
  onToggleFullscreen,
  isFullscreen = false,
  zoomLevel,
  theme = 'light',
  className,
  style,
}) => {
  const isDark = theme === 'dark';
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleExportPDF = async () => {
    setIsPdfLoading(true);
    try {
      await onExportPDF();
    } finally {
      setIsPdfLoading(false);
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#0f172a',
    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.15s ease',
  };

  return (
    <div
      className={`tbib-mindmap-controller ${className || ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px',
        borderRadius: '12px',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.08)',
        userSelect: 'none',
        zIndex: 20,
        ...style,
      }}
    >
      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        style={buttonStyle}
      >
        <ZoomIn size={14} />
      </button>

      {/* Zoom readout */}
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'monospace',
          color: isDark ? '#94a3b8' : '#64748b',
          width: '40px',
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(zoomLevel * 100)}%
      </span>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        style={buttonStyle}
      >
        <ZoomOut size={14} />
      </button>

      <span
        style={{
          display: 'block',
          width: '1px',
          height: '18px',
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          margin: '0 2px',
        }}
      />

      {/* Fit to screen */}
      <button
        type="button"
        onClick={onFit}
        title="Fit to screen"
        style={buttonStyle}
      >
        <ScanSearch size={14} />
      </button>

      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          style={buttonStyle}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      )}

      <span
        style={{
          display: 'block',
          width: '1px',
          height: '18px',
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          margin: '0 2px',
        }}
      />

      {/* Download SVG */}
      <button
        type="button"
        onClick={onDownloadSVG}
        title="Download as SVG"
        style={buttonStyle}
      >
        <FileImage size={14} />
      </button>

      {/* Export as PDF */}
      <button
        type="button"
        onClick={handleExportPDF}
        title="Export as PDF"
        disabled={isPdfLoading}
        style={{
          ...buttonStyle,
          opacity: isPdfLoading ? 0.5 : 1,
          cursor: isPdfLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isPdfLoading ? (
          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <FileDown size={14} />
        )}
      </button>
    </div>
  );
};
