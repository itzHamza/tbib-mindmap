import { TreeNode, DEPTH_INLINE_STYLES } from './types';
import { getBoundingBox } from './layout';

export const downloadSvg = (svgElement: SVGSVGElement, filename = 'mindmap.svg'): void => {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const exportPdf = async (
  layout: TreeNode,
  filename = 'mindmap-pro.pdf'
): Promise<void> => {
  const { default: jsPDF } = await import('jspdf');

  const SCALE = 3;
  const PAD = 60;
  const bb = getBoundingBox(layout);
  const contentW = bb.maxX - bb.minX;
  const contentH = bb.maxY - bb.minY;

  const canvas = document.createElement('canvas');
  canvas.width = (contentW + PAD * 2) * SCALE;
  canvas.height = (contentH + PAD * 2) * SCALE;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  const ox = PAD - bb.minX;
  const oy = PAD - bb.minY;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const drawEdges = (node: TreeNode) => {
    if (!node.children || node.collapsed) return;
    for (const child of node.children) {
      const isLeft = child.side === 'left';
      const sx = (isLeft ? (node.x ?? 0) : (node.x ?? 0) + (node.width ?? 0)) + ox;
      const sy = (node.y ?? 0) + (node.height ?? 0) / 2 + oy;
      const tx = (isLeft ? (child.x ?? 0) + (child.width ?? 0) : (child.x ?? 0)) + ox;
      const ty = (child.y ?? 0) + (child.height ?? 0) / 2 + oy;
      const dx = Math.abs(tx - sx) / 2;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        isLeft ? sx - dx : sx + dx,
        sy,
        isLeft ? tx + dx : tx - dx,
        ty,
        tx,
        ty
      );
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawEdges(child);
    }
  };

  const drawNodes = (node: TreeNode) => {
    const tokens =
      DEPTH_INLINE_STYLES[
        Math.min(
          Math.max(0, (node.depth ?? 1) - 1),
          DEPTH_INLINE_STYLES.length - 1
        )
      ];
    const nx = (node.x ?? 0) + ox;
    const ny = (node.y ?? 0) + oy;
    const nw = node.width ?? 120;
    const nh = node.height ?? 32;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    roundRect(nx, ny, nw, nh, 8);
    ctx.fillStyle = tokens.background;
    ctx.fill();
    ctx.restore();

    roundRect(nx, ny, nw, nh, 8);
    ctx.strokeStyle = tokens.borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    const fontSize = 11;
    ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = tokens.color;
    ctx.textBaseline = 'middle';
    const hPad = 12;
    const maxTW = nw - hPad * 2;
    const lines = wrapText(node.label ?? '', maxTW);
    const lineH = fontSize * 1.5;
    const startY = ny + (nh - lines.length * lineH) / 2 + lineH / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], nx + hPad, startY + i * lineH, maxTW);
    }

    if (!node.collapsed && node.children) {
      for (const child of node.children) drawNodes(child);
    }
  };

  drawEdges(layout);
  drawNodes(layout);

  const pdfW = contentW + PAD * 2;
  const pdfH = contentH + PAD * 2;
  const pdf = new jsPDF({
    orientation: pdfW > pdfH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pdfW, pdfH],
  });
  pdf.addImage(
    canvas.toDataURL('image/png', 1.0),
    'PNG',
    0,
    0,
    pdfW,
    pdfH,
    undefined,
    'FAST'
  );
  pdf.save(filename);
};
