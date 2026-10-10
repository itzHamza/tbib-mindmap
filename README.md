# 🧠 TBiB Mindmap Viewer

[![npm version (react)](https://img.shields.io/npm/v/@tbib-mindmap-viewer/react.svg?color=6366f1&label=react)](https://www.npmjs.com/package/@tbib-mindmap-viewer/react)
[![npm version (core)](https://img.shields.io/npm/v/@tbib-mindmap-viewer/core.svg?color=6366f1&label=core)](https://www.npmjs.com/package/@tbib-mindmap-viewer/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-tbib--mindmap.vercel.app-000000?style=flat&logo=vercel)](https://tbib-mindmap.vercel.app/)

An open-source, high-performance, interactive **Markdown Mindmap Viewer & Tree Layout Engine** for React and modern web applications.

👉 **[Experience the Live Interactive Demo](https://tbib-mindmap.vercel.app/)**

Transform standard Markdown headings and nested bullet lists into beautiful, expandable mindmaps with 60fps GPU-accelerated pan & zoom, mobile multi-touch gestures, and high-resolution SVG & PDF exports.

---

## ✨ Features

- 📝 **Markdown-Powered**: Turn raw markdown text directly into structured mindmaps with support for headings (`#`, `##`, `###`) and multi-level bullet lists.
- 📐 **Dual Layout Engines**:
  - **Horizontal**: Standard Left-to-Right hierarchical tree view.
  - **Center / Radial**: Balances branches symmetrically on the Left and Right of the central topic node.
- 📱 **Mobile & Tablet Multi-Touch Gestures**:
  - **1-Finger Drag**: Fluid pan across the canvas.
  - **2-Finger Pinch**: GPU-accelerated 60fps pinch-to-zoom centered on the touch focal point.
- 🎨 **Self-Contained Styling & Variants**:
  - 3 node styles: `filled` (depth-based color hierarchy), `stroke` (crisp borders), and `glass` (translucent backdrop blur).
  - Native **Light** and **Dark** mode support out of the box with zero external CSS framework requirements.
- ➕ **Collapsible Branches**: Interactive `+` / `−` badges to collapse and expand subtrees on demand.
- 🎛️ **Floating Control Toolbar (`<MindmapController />`)**:
  - Clean floating dock with crisp FontAwesome vector icons.
  - Zoom In, Zoom Out, Percentage Readout, Fit to Screen, Fullscreen Toggle, SVG download, and PDF export.
- 💾 **High-Resolution Exports**:
  - **SVG**: Instant vector XML export.
  - **PDF**: Renders a crisp 3x-supersampled snapshot directly to standard PDF using `jspdf`.
- ⚡ **Zero Bloat & Framework Agnostic Core**: Core tree layout algorithms and parsing logic are bundled in a pure TypeScript package (`@tbib-mindmap-viewer/core`) that works with or without React.

---

## 📦 Packages

| Package | Description | Version |
|---|---|---|
| [`@tbib-mindmap-viewer/core`](https://www.npmjs.com/package/@tbib-mindmap-viewer/core) | Framework-agnostic markdown parser, layout engine, and export utilities | [![npm](https://img.shields.io/npm/v/@tbib-mindmap-viewer/core)](https://www.npmjs.com/package/@tbib-mindmap-viewer/core) |
| [`@tbib-mindmap-viewer/react`](https://www.npmjs.com/package/@tbib-mindmap-viewer/react) | Ready-to-use React components (`<Mindmap />`, `<MindmapController />`) | [![npm](https://img.shields.io/npm/v/@tbib-mindmap-viewer/react)](https://www.npmjs.com/package/@tbib-mindmap-viewer/react) |

---

## 🚀 Quick Start (React)

### 1. Install

```bash
npm install @tbib-mindmap-viewer/react @tbib-mindmap-viewer/core framer-motion
```

### 2. Usage

```tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  Mindmap,
  MindmapController,
  type MindmapHandle,
} from '@tbib-mindmap-viewer/react';

const MARKDOWN = `
# Artificial Intelligence
## 1. Machine Learning
- Supervised Learning
  - Classification
  - Regression
- Unsupervised Learning
  - Clustering
  - Dimensionality Reduction
- Reinforcement Learning
## 2. Deep Learning
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)
- Transformers & Large Language Models
## 3. Applications
- Computer Vision
- Natural Language Processing
- Autonomous Systems
`;

export function MyMindmapApp() {
  const mindmapRef = useRef<MindmapHandle>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layout, setLayout] = useState<'Horizontal' | 'Center'>('Center');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Track zoom level for toolbar display
  useEffect(() => {
    const id = setInterval(() => {
      if (mindmapRef.current) {
        setZoomLevel(mindmapRef.current.zoomLevel);
      }
    }, 150);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '80vh', overflow: 'hidden' }}>
      {/* Floating Toolbar */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 30 }}>
        <MindmapController
          onZoomIn={() => mindmapRef.current?.zoomIn()}
          onZoomOut={() => mindmapRef.current?.zoomOut()}
          onFit={() => mindmapRef.current?.fitScreen()}
          onDownloadSVG={() => mindmapRef.current?.downloadSVG('my-map.svg')}
          onExportPDF={() => mindmapRef.current?.exportAsPDF('my-map.pdf') ?? Promise.resolve()}
          zoomLevel={zoomLevel}
          theme={theme}
        />
      </div>

      {/* Interactive Mindmap Canvas */}
      <Mindmap
        ref={mindmapRef}
        content={MARKDOWN}
        type={layout}
        nodeVariant="filled"
        theme={theme}
      />
    </div>
  );
}
```

---

## 🛠️ Framework-Agnostic Usage (Core)

You can use `@tbib-mindmap-viewer/core` in any JavaScript or TypeScript project without React:

```ts
import {
  parseMarkdownToTree,
  computeLayout,
  getBoundingBox,
  exportPdf,
} from '@tbib-mindmap-viewer/core';

const markdown = `
# Project Plan
## Phase 1: Planning
## Phase 2: Execution
- Development
- Testing
## Phase 3: Launch
`;

// 1. Parse markdown to a hierarchical tree
const tree = parseMarkdownToTree(markdown);

// 2. Compute 2D node coordinates ('Horizontal' or 'Center')
const layout = computeLayout(tree, 'Center');

// 3. Inspect calculated node positions
console.log('Root node:', layout.x, layout.y, layout.width, layout.height);
console.log('Branches:', layout.children);

// 4. Export directly to PDF
await exportPdf(layout, 'project-plan.pdf');
```

---

## ⚙️ Component Props & APIs

### `<Mindmap />`

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string` | *(required)* | Markdown string containing headings (`#`) and lists (`-`). |
| `type` | `'Horizontal' \| 'Center'` | `'Horizontal'` | Layout geometry algorithm. |
| `nodeVariant` | `'filled' \| 'stroke' \| 'glass'` | `'filled'` | Node visual style appearance. |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme for background, edges, and node borders. |
| `className` | `string` | `undefined` | Optional CSS class name for container. |
| `style` | `React.CSSProperties` | `undefined` | Optional container inline styles. |
| `onNodeClick` | `(node: TreeNode) => void` | `undefined` | Callback invoked when a node is clicked. |

### `MindmapHandle` (via `ref`)

| Method / Property | Description |
|---|---|
| `zoomIn()` | Increases zoom scale by `+0.15`. |
| `zoomOut()` | Decreases zoom scale by `-0.15`. |
| `fitScreen()` | Automatically centers and fits the entire mindmap to the container bounds. |
| `downloadSVG(filename?)` | Serializes the SVG canvas and triggers a file download (`.svg`). |
| `exportAsPDF(filename?)` | Generates and downloads a high-resolution 3x supersampled vector PDF (`.pdf`). |
| `zoomLevel` | Current zoom factor (e.g. `1.0`, `1.5`). |

### `<MindmapController />`

| Prop | Type | Description |
|---|---|---|
| `onZoomIn` | `() => void` | Handler for Zoom In button click. |
| `onZoomOut` | `() => void` | Handler for Zoom Out button click. |
| `onFit` | `() => void` | Handler for Fit to Screen button click. |
| `onDownloadSVG` | `() => void` | Handler for Download SVG button click. |
| `onExportPDF` | `() => Promise<void>` | Handler for Export PDF button click. |
| `onToggleFullscreen` | `(() => void) \| undefined` | Optional handler for Fullscreen button click. |
| `isFullscreen` | `boolean` | Current fullscreen status. |
| `zoomLevel` | `number` | Current zoom scale percentage to display. |
| `theme` | `'light' \| 'dark'` | Color scheme for toolbar buttons and backdrop. |

---

## 💻 Local Development

Clone the monorepo and run the interactive demo:

```bash
git clone https://github.com/itzHamza/tbib-mindmap.git
cd tbib-mindmap
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to test live markdown editing, layout toggling, variant selection, and exports!

---

## 📄 License

MIT © [itzHamza](https://github.com/itzHamza)
