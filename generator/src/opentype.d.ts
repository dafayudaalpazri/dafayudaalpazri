/** The small part of opentype.js 2.0 this generator uses (the package ships no type declarations). */
declare module 'opentype.js' {
  interface PathCommand {
    type: string;
    x?: number;
    y?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }
  interface Path {
    commands: PathCommand[];
  }
  interface Glyph {
    index: number;
    name: string | null;
    advanceWidth?: number;
    path: Path;
    getPath(x: number, y: number, fontSize: number): Path;
  }
  interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    tables: Record<string, unknown>;
    charToGlyph(c: string): Glyph;
    getKerningValue(left: Glyph, right: Glyph): number;
  }
  const opentype: { parse(buffer: ArrayBuffer): Font };
  export default opentype;
}
