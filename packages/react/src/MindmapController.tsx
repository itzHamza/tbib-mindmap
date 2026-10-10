import React, { useState } from 'react';
import { MindmapControllerProps } from './types';

// FontAwesome SVG Paths (Solid)
const ICONS = {
  // fa-magnifying-glass-plus
  zoomIn: (
    <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM184 208c0 13.3 10.7 24 24 24h32v32c0 13.3 10.7 24 24 24s24-10.7 24-24V232h32c13.3 0 24-10.7 24-24s-10.7-24-24-24H288V152c0-13.3-10.7-24-24-24s-24 10.7-24 24v32H208c-13.3 0-24 10.7-24 24z" />
    </svg>
  ),
  // fa-magnifying-glass-minus
  zoomOut: (
    <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM136 208c0 13.3 10.7 24 24 24H256c13.3 0 24-10.7 24-24s-10.7-24-24-24H160c-13.3 0-24 10.7-24 24z" />
    </svg>
  ),
  // fa-arrows-to-dot (Fit)
  fit: (
    <svg viewBox="0 0 448 512" width="13" height="13" fill="currentColor">
      <path d="M64 32C28.7 32 0 60.7 0 96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zm320 0h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-35.3-28.7-64-64-64zM64 480h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 35.3 28.7 64 64 64zm320 0c35.3 0 64-28.7 64-64v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h64zM224 208a48 48 0 1 0 0 96 48 48 0 1 0 0-96z" />
    </svg>
  ),
  // fa-expand
  expand: (
    <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor">
      <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM416 32h-96c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32zM32 480h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32zm384 0c17.7 0 32-14.3 32-32v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h96z" />
    </svg>
  ),
  // fa-compress
  compress: (
    <svg viewBox="0 0 448 512" width="12" height="12" fill="currentColor">
      <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32h-64V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32v-96c0-17.7-14.3-32-32-32H32zm384 0h-96c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32v-64h64c17.7 0 32-14.3 32-32s-14.3-32-32-32z" />
    </svg>
  ),
  // fa-file-image
  fileImage: (
    <svg viewBox="0 0 384 512" width="12" height="12" fill="currentColor">
      <path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM144 256a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-59.5 98.7L64 384H320l-45.7-61c-8.9-11.9-26.6-13.6-37.5-3.8l-37.9 34.1-70.1-87.6c-9.5-11.9-27.4-12.7-37.9-1.8l-6.4 6.7z" />
    </svg>
  ),
  // fa-file-pdf
  filePdf: (
    <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor">
      <path d="M64 464l48 0 0 48-48 0c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L229.5 0c17 0 33.3 6.7 45.3 18.7l109.3 109.3c12 12 18.7 28.3 18.7 45.3L402.7 448c0 35.3-28.7 64-64 64l-48 0 0-48 48 0c8.8 0 16-7.2 16-16l0-256-112 0c-26.5 0-48-21.5-48-48L192.7 32 64 32c-8.8 0-16 7.2-16 16l0 384c0 8.8 7.2 16 16 16zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 48c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-112c0-8.8 7.2-16 16-16zm32 112c8.8 0 16-7.2 16-16l0-48c0-8.8-7.2-16-16-16l-16 0 0 80 16 0zm112-112l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-112c0-8.8 7.2-16 16-16z" />
    </svg>
  ),
  // fa-circle-notch (Spinner)
  spinner: (
    <svg viewBox="0 0 512 512" width="13" height="13" fill="currentColor" style={{ animation: 'tbib-spin 1s linear infinite' }}>
      <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 139.9 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 139.9 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z" />
    </svg>
  ),
};

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
      <style>{`
        @keyframes tbib-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Zoom In (fa-magnifying-glass-plus) */}
      <button
        type="button"
        onClick={onZoomIn}
        title="Zoom In"
        style={buttonStyle}
      >
        {ICONS.zoomIn}
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

      {/* Zoom Out (fa-magnifying-glass-minus) */}
      <button
        type="button"
        onClick={onZoomOut}
        title="Zoom Out"
        style={buttonStyle}
      >
        {ICONS.zoomOut}
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

      {/* Fit to screen (fa-arrows-to-dot) */}
      <button
        type="button"
        onClick={onFit}
        title="Fit to screen"
        style={buttonStyle}
      >
        {ICONS.fit}
      </button>

      {/* Fullscreen toggle (fa-expand / fa-compress) */}
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          style={buttonStyle}
        >
          {isFullscreen ? ICONS.compress : ICONS.expand}
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

      {/* Download SVG (fa-file-image) */}
      <button
        type="button"
        onClick={onDownloadSVG}
        title="Download as SVG"
        style={buttonStyle}
      >
        {ICONS.fileImage}
      </button>

      {/* Export as PDF (fa-file-pdf) */}
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
        {isPdfLoading ? ICONS.spinner : ICONS.filePdf}
      </button>
    </div>
  );
};
