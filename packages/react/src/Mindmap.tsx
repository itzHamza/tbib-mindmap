import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  TreeNode,
  parseMarkdownToTree,
  computeLayout,
  getBoundingBox,
  downloadSvg,
  exportPdf,
  DEPTH_INLINE_STYLES,
  DEPTH_INLINE_STYLES_DARK,
  STROKE_TOKENS,
  GLASS_TOKENS,
} from '@tbib-mindmap-viewer/core';
import { motion, AnimatePresence } from 'framer-motion';
import { MindmapHandle, MindmapProps } from './types';

export const Mindmap = forwardRef<MindmapHandle, MindmapProps>(
  (
    {
      content,
      type = 'Horizontal',
      nodeVariant = 'filled',
      theme = 'light',
      className,
      style,
      onNodeClick,
    },
    ref
  ) => {
    const isDark = theme === 'dark';
    const [treeData, setTreeData] = useState(() => parseMarkdownToTree(content));
    const [transform, setTransform] = useState({ x: 60, y: 60, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Sync content changes
    useEffect(() => {
      setTreeData(parseMarkdownToTree(content));
    }, [content]);

    const layout = useMemo(
      () => computeLayout(JSON.parse(JSON.stringify(treeData)), type),
      [treeData, type]
    );

    // ── Toggle node collapse ──────────────────────────────────────────────────
    const toggleNode = useCallback(
      (targetId: string, node: TreeNode = treeData): boolean => {
        if (node.id === targetId) {
          node.collapsed = !node.collapsed;
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (toggleNode(targetId, child)) return true;
          }
        }
        return false;
      },
      [treeData]
    );

    const handleToggle = (node: TreeNode, e: React.MouseEvent) => {
      e.stopPropagation();
      const newData = JSON.parse(JSON.stringify(treeData));
      toggleNode(node.id, newData);
      setTreeData(newData);
      if (onNodeClick) onNodeClick(node);
    };

    // ── Fit screen ────────────────────────────────────────────────────────────
    const fitScreen = useCallback(() => {
      if (!containerRef.current) return;
      const { width: cw, height: ch } = containerRef.current.getBoundingClientRect();
      const bb = getBoundingBox(layout);
      const contentW = bb.maxX - bb.minX || 1;
      const contentH = bb.maxY - bb.minY || 1;
      const pad = 60;
      const scale = Math.min(
        Math.max(0.3, Math.min((cw - pad * 2) / contentW, (ch - pad * 2) / contentH)),
        2
      );
      setTransform({
        x: (cw - contentW * scale) / 2 - bb.minX * scale,
        y: (ch - contentH * scale) / 2 - bb.minY * scale,
        scale,
      });
    }, [layout]);

    useEffect(() => {
      const t = setTimeout(fitScreen, 100);
      return () => clearTimeout(t);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Imperative handle ─────────────────────────────────────────────────────
    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => setTransform((p) => ({ ...p, scale: Math.min(3, +(p.scale + 0.15).toFixed(2)) })),
        zoomOut: () => setTransform((p) => ({ ...p, scale: Math.max(0.3, +(p.scale - 0.15).toFixed(2)) })),
        fitScreen,
        downloadSVG: (filename = 'mindmap.svg') => {
          if (svgRef.current) downloadSvg(svgRef.current, filename);
        },
        exportAsPDF: async (filename = 'mindmap-pro.pdf') => {
          await exportPdf(layout, filename);
        },
        get zoomLevel() {
          return transform.scale;
        },
      }),
      [fitScreen, layout, transform.scale]
    );

    // ── Pan & Zoom handlers ───────────────────────────────────────────────────
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = rect ? e.clientX - rect.left : 0;
      const cy = rect ? e.clientY - rect.top : 0;

      setTransform((p) => {
        const nextScale = Math.min(Math.max(0.3, +(p.scale + e.deltaY * -0.001).toFixed(2)), 3);
        const ratio = nextScale / p.scale;
        return {
          scale: nextScale,
          x: cx - (cx - p.x) * ratio,
          y: cy - (cy - p.y) * ratio,
        };
      });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-node]')) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setTransform((p) => ({
        ...p,
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      }));
    };

    const handleMouseUp = () => setIsDragging(false);

    // ── Touch gestures (Mobile & Tablet: 1-finger Pan, 2-finger Pinch Zoom) ───
    const touchState = useRef<{
      initialDist: number;
      initialScale: number;
      initialTransform: { x: number; y: number };
      touchCenter: { x: number; y: number };
      panStart: { x: number; y: number };
      isPinching: boolean;
      isPanning: boolean;
    }>({
      initialDist: 0,
      initialScale: 1,
      initialTransform: { x: 0, y: 0 },
      touchCenter: { x: 0, y: 0 },
      panStart: { x: 0, y: 0 },
      isPinching: false,
      isPanning: false,
    });

    const getTouchDistance = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if ((e.target as HTMLElement).closest('[data-node]')) return;

      if (e.touches.length === 1) {
        // 1 finger: Pan
        touchState.current.isPanning = true;
        touchState.current.isPinching = false;
        touchState.current.panStart = {
          x: e.touches[0].clientX - transform.x,
          y: e.touches[0].clientY - transform.y,
        };
      } else if (e.touches.length === 2) {
        // 2 fingers: Pinch-to-zoom
        touchState.current.isPinching = true;
        touchState.current.isPanning = false;
        touchState.current.initialDist = getTouchDistance(e.touches[0], e.touches[1]);
        touchState.current.initialScale = transform.scale;
        touchState.current.initialTransform = { x: transform.x, y: transform.y };

        const rect = containerRef.current?.getBoundingClientRect();
        touchState.current.touchCenter = {
          x: ((e.touches[0].clientX + e.touches[1].clientX) / 2) - (rect?.left || 0),
          y: ((e.touches[0].clientY + e.touches[1].clientY) / 2) - (rect?.top || 0),
        };
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (touchState.current.isPinching && e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        if (touchState.current.initialDist > 0) {
          const factor = currentDist / touchState.current.initialDist;
          const nextScale = Math.min(
            Math.max(0.3, +(touchState.current.initialScale * factor).toFixed(2)),
            3
          );

          const { x: cx, y: cy } = touchState.current.touchCenter;
          const ratio = nextScale / touchState.current.initialScale;
          const newX = cx - (cx - touchState.current.initialTransform.x) * ratio;
          const newY = cy - (cy - touchState.current.initialTransform.y) * ratio;

          setTransform({
            scale: nextScale,
            x: newX,
            y: newY,
          });
        }
      } else if (touchState.current.isPanning && e.touches.length === 1) {
        if (e.cancelable) e.preventDefault();
        setTransform((p) => ({
          ...p,
          x: e.touches[0].clientX - touchState.current.panStart.x,
          y: e.touches[0].clientY - touchState.current.panStart.y,
        }));
      }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length === 0) {
        touchState.current.isPanning = false;
        touchState.current.isPinching = false;
        touchState.current.initialDist = 0;
      } else if (e.touches.length === 1) {
        touchState.current.isPinching = false;
        touchState.current.isPanning = true;
        touchState.current.panStart = {
          x: e.touches[0].clientX - transform.x,
          y: e.touches[0].clientY - transform.y,
        };
      }
    };

    // ── Edge rendering ────────────────────────────────────────────────────────
    const edgePath = (parent: TreeNode, child: TreeNode): string => {
      const isLeft = child.side === 'left';
      const sx = isLeft ? (parent.x ?? 0) : (parent.x ?? 0) + (parent.width ?? 0);
      const sy = (parent.y ?? 0) + (parent.height ?? 0) / 2;
      const tx = isLeft ? (child.x ?? 0) + (child.width ?? 0) : (child.x ?? 0);
      const ty = (child.y ?? 0) + (child.height ?? 0) / 2;

      const dx = Math.abs(tx - sx) / 2;
      const cpSx = isLeft ? sx - dx : sx + dx;
      const cpTx = isLeft ? tx + dx : tx - dx;

      return `M ${sx} ${sy} C ${cpSx} ${sy}, ${cpTx} ${ty}, ${tx} ${ty}`;
    };

    const renderEdges = (node: TreeNode): React.ReactNode[] => {
      if (!node.children || node.collapsed) return [];
      return node.children.flatMap((child) => [
        <motion.path
          key={`edge-${node.id}-${child.id}`}
          d={edgePath(node, child)}
          fill="none"
          stroke={isDark ? '#4b5563' : '#9ca3af'}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        />,
        ...renderEdges(child),
      ]);
    };

    // ── Node inline styles ────────────────────────────────────────────────────
    const getNodeInlineStyle = (node: TreeNode): React.CSSProperties => {
      const tokenList = isDark ? DEPTH_INLINE_STYLES_DARK : DEPTH_INLINE_STYLES;
      if (nodeVariant === 'filled') {
        const tokens =
          tokenList[
            Math.min(
              Math.max(0, (node.depth ?? 1) - 1),
              tokenList.length - 1
            )
          ];
        return {
          backgroundColor: tokens.background,
          color: tokens.color,
          borderColor: tokens.borderColor,
          borderWidth: 1,
          borderStyle: 'solid',
        };
      }
      if (nodeVariant === 'stroke') {
        return {
          backgroundColor: isDark ? '#1e293b' : STROKE_TOKENS.background,
          color: isDark ? '#f8fafc' : STROKE_TOKENS.color,
          borderColor: STROKE_TOKENS.borderColor,
          borderWidth: 2,
          borderStyle: 'solid',
        };
      }
      // glass / default
      return {
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : GLASS_TOKENS.background,
        color: isDark ? '#f8fafc' : GLASS_TOKENS.color,
        borderColor: isDark ? '#334155' : GLASS_TOKENS.borderColor,
        borderWidth: 1,
        borderStyle: 'solid',
        backdropFilter: 'blur(8px)',
      };
    };

    // ── Node rendering ────────────────────────────────────────────────────────
    const renderNodes = (node: TreeNode): React.ReactNode[] => {
      const hasChildren = !!node.children?.length;
      const nodeInlineStyle = getNodeInlineStyle(node);
      const badgeBg = isDark ? '#6366f1' : DEPTH_INLINE_STYLES[0].background;

      const nodeEl = (
        <AnimatePresence key={`node-${node.id}`}>
          <motion.g
            transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <foreignObject
              width={node.width}
              height={node.height}
              style={{ overflow: 'visible' }}
            >
              <motion.div
                data-node="true"
                onClick={(e) => handleToggle(node, e)}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                // @ts-expect-error – xmlns required inside SVG foreignObject
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: node.width,
                  minHeight: node.height,
                  ...nodeInlineStyle,
                  borderRadius: '0.5rem',
                  boxSizing: 'border-box',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0,0,0,0.35)'
                    : '0 1px 3px rgba(0,0,0,0.08)',
                  lineHeight: '1.35',
                  userSelect: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    width: '100%',
                    userSelect: 'none',
                    lineHeight: '1.5',
                    color: 'inherit',
                  }}
                >
                  {node.label}
                </span>

                {/* Collapse badge */}
                {hasChildren && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      [node.side === 'left' ? 'left' : 'right']: '-10px',
                      backgroundColor: badgeBg,
                      color: '#ffffff',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 700,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      zIndex: 10,
                      userSelect: 'none',
                      outline: isDark ? '1.5px solid #1e293b' : '1.5px solid #ffffff',
                    }}
                  >
                    {node.collapsed ? '+' : '−'}
                  </div>
                )}
              </motion.div>
            </foreignObject>
          </motion.g>
        </AnimatePresence>
      );

      return [
        nodeEl,
        ...(!node.collapsed && node.children ? node.children.flatMap(renderNodes) : []),
      ];
    };

    return (
      <div
        ref={containerRef}
        className={`tbib-mindmap-canvas ${className || ''}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          overflow: 'hidden',
          borderRadius: '12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          position: 'relative',
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          ...style,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }}>
          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          >
            {renderEdges(layout)}
            {renderNodes(layout)}
          </g>
        </svg>
      </div>
    );
  }
);

Mindmap.displayName = 'Mindmap';
