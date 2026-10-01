declare module 'react' {
  export = React;
  namespace React {
    type ReactNode = any;
    type FC<P = {}> = (props: P) => any;
    function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
    function useRef<T>(initialValue?: T): { current: T };
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'three' {
  export const Scene: any;
  export const PerspectiveCamera: any;
  export const WebGLRenderer: any;
  export const TextureLoader: any;
  export const Group: any;
  export const Vector3: any;
  export const Color: any;
  export const SphereGeometry: any;
  export const ShaderMaterial: any;
  export const Mesh: any;
  export const Clock: any;
  export const ACESFilmicToneMapping: any;
  export const NormalBlending: any;
  export const AdditiveBlending: any;
  export const BackSide: any;
  export type IUniform = any;
  export type PerspectiveCamera = any;
  export type Group = any;
  export type Scene = any;
  export type WebGLRenderer = any;
}

declare module 'lenis' {
  export default class Lenis {
    constructor(options?: any);
    on(event: string, callback: (...args: any[]) => void): void;
    raf(time: number): void;
    destroy(): void;
  }
}

declare module 'gsap' {
  const gsap: {
    registerPlugin(...plugins: any[]): void;
    timeline(vars?: any): any;
    to(targets: any, vars: any, position?: any): any;
    ticker: {
      add(callback: (time: number) => void): void;
      remove(callback: (time: number) => void): void;
      lagSmoothing(threshold: number, adjustedLag?: number): void;
    };
  };
  export default gsap;
}

declare module 'gsap/ScrollTrigger' {
  export const ScrollTrigger: {
    update(): void;
    refresh(): void;
    getAll(): Array<{ kill(): void }>;
  };
}
