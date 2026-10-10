import { describe, it, expect } from 'vitest';
import { Mindmap, MindmapController } from '../index';

describe('React exports', () => {
  it('exports Mindmap and MindmapController components', () => {
    expect(Mindmap).toBeDefined();
    expect(MindmapController).toBeDefined();
  });
});
