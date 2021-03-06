import queryString from "query-string"



export const defaultLSData = {
  axiom: "A",
  productionText: ["A:FA"],
  iterations: 2
}


export interface CompleteLSExample {
  lsProps: LSProps
  gfxProps?: GFXProps
  name?: string
}

export interface LSProps {
  axiom: string
  productions: string[]
  iterations: number
}

type renderTypes = "2d" | "3d" | "text" | "pixel";
export interface GFXProps {
  renderType?: renderTypes[]
  length?: number
  angle?: number
  center?: number[]
  width?: number
  height?: number
  strokeWeight?: number
}


export function flattenLSProps(ls: LSProps, delimiter: string) {
  let stringArr = [ls.axiom, ...ls.productions];
  return stringArr.reduce((str, t) => str + t + delimiter, "")
}

function cleanParam(o: string | string[]): string {
  if (o instanceof Array) {
    return o[0] as string
  }
  else return o as string
}
export function decodeParams(paramString: string): {lsProps: LSProps, gfxProps?: GFXProps} {
  const parsed = queryString.parse(paramString);
  let axiom = parsed.a ? cleanParam(parsed.a) : defaultLSData.axiom;
  let iterations = parsed.i ? parseFloat(cleanParam(parsed.i)) : defaultLSData.iterations;
  let productions = defaultLSData.productionText;
  if (parsed.p) productions = parsed.p instanceof Array ? parsed.p : [cleanParam(parsed.p)];  
  let gfxProps : GFXProps = {};
  if (parsed.length || parsed.angle) {
    if (parsed.length) gfxProps.length = parseFloat(cleanParam(parsed.length));
    if (parsed.angle) gfxProps.angle = parseFloat(cleanParam(parsed.angle))
    if (parsed.c0) gfxProps.center = [parseFloat(cleanParam(parsed.c0)),0];
    if (parsed.c1) gfxProps.center = [gfxProps.center ? gfxProps.center[0] : 0, parseFloat(cleanParam(parsed.c1))];
  }
  return {lsProps: {axiom: axiom, iterations: iterations, productions: productions}, gfxProps: gfxProps};
} 

export function encodeParams(lsProps: Partial<LSProps>, gfxProps?: GFXProps) {
  let axiomString = lsProps.axiom ? "a=" + encodeURIComponent(lsProps.axiom) : "a=";
  let iterationString = lsProps.iterations ? "&i=" + encodeURIComponent(lsProps.iterations) : "";
  let productionString = lsProps.productions ? lsProps.productions.reduce((str, p) => str + "&p=" + encodeURIComponent(p), "") : "";
  
  
  let gfxPropsString = ""; 
  if (gfxProps) {
    if (gfxProps.length) {
      gfxPropsString += "&length=" + encodeURIComponent(gfxProps.length);
    }
    if (gfxProps.angle) {
      gfxPropsString += "&angle=" + encodeURIComponent(gfxProps.angle);
    }
    if(gfxProps.center) {
      gfxPropsString += "&c0=" + encodeURIComponent(gfxProps.center[0]) + "&c1=" + encodeURIComponent(gfxProps.center[1])
    }
  }
  let paramString =  "?" + axiomString + productionString + iterationString + gfxPropsString;
  return paramString;
}