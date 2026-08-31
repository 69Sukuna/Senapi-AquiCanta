// mind-ar no publica tipos propios. Se declara aquí solo la superficie de la API
// que usa `EscenaPinturaAR` — ver node_modules/mind-ar/src/image-target/three.js
// para la implementación completa si hace falta ampliar esta declaración.
declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type { Camera, Group, Scene, WebGLRenderer } from 'three';

  interface AnchorMindAR {
    group: Group;
    onTargetFound?: () => void;
    onTargetLost?: () => void;
  }

  interface OpcionesMindARThree {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    filterMinCF?: number;
    filterBeta?: number;
    warmupTolerance?: number;
    missTolerance?: number;
    uiLoading?: 'yes' | 'no';
    uiScanning?: 'yes' | 'no';
    uiError?: 'yes' | 'no';
  }

  export class MindARThree {
    constructor(opciones: OpcionesMindARThree);
    renderer: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    addAnchor(targetIndex: number): AnchorMindAR;
    start(): Promise<void>;
    stop(): void;
    resize(): void;
  }
}
