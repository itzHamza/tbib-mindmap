import React from 'react';
import {
  TreeNode,
  LayoutType,
  NodeVariant,
} from '@tbib-mindmap/core';

export interface MindmapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitScreen: () => void;
  downloadSVG: (filename?: string) => void;
  exportAsPDF: (filename?: string) => Promise<void>;
  zoomLevel: number;
}

export interface MindmapProps {
  content: string;
  type?: LayoutType;
  nodeVariant?: NodeVariant;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
  onNodeClick?: (node: TreeNode) => void;
}

export interface MindmapControllerProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onDownloadSVG: () => void;
  onExportPDF: () => Promise<void>;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  zoomLevel: number;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}
