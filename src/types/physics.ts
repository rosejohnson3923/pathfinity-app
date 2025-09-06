// Physics Types and Interfaces

export interface PhysicsProblem {
  type: 'projectile' | 'incline' | 'pulley' | 'circular';
  parameters: Record<string, number>;
  diagram: CanvasElements[];
  id: string;
  title: string;
  description: string;
}

export interface SolutionStep {
  id: string;
  title: string;
  explanation: string;
  equations: string[];
  calculations: Calculation[];
  canvasState?: CanvasState;
  visualElements?: VisualElement[];
}

export interface Calculation {
  variable: string;
  formula: string;
  substitution: string;
  result: number;
  unit: string;
}

export interface CanvasState {
  vectors: ForceVector[];
  objects: PhysicsObject[];
  grid: GridSettings;
  scale: number;
  origin: Point;
}

export interface ForceVector {
  id: string;
  name: string;
  magnitude: number;
  angle: number; // degrees
  origin: Point;
  color: string;
  type: 'gravity' | 'normal' | 'friction' | 'tension' | 'applied' | 'centripetal';
  visible: boolean;
}

export interface PhysicsObject {
  id: string;
  type: 'mass' | 'incline' | 'pulley' | 'surface';
  position: Point;
  dimensions: { width: number; height: number };
  angle?: number;
  mass?: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface GridSettings {
  spacing: number;
  visible: boolean;
  color: string;
  opacity: number;
}

export interface CanvasElements {
  vectors: ForceVector[];
  objects: PhysicsObject[];
  trajectory?: Point[];
}

export interface VisualElement {
  type: 'arrow' | 'line' | 'circle' | 'rectangle' | 'text';
  properties: Record<string, any>;
  animation?: Animation;
}

export interface Animation {
  type: 'fadeIn' | 'slideIn' | 'scale' | 'rotate';
  duration: number;
  delay?: number;
}

export interface ProblemParameters {
  // Projectile Motion
  launchAngle?: number;
  initialVelocity?: number;
  height?: number;
  
  // Inclined Plane
  inclineAngle?: number;
  mass?: number;
  frictionCoefficient?: number;
  
  // Pulley System
  mass1?: number;
  mass2?: number;
  pulleyRadius?: number;
  
  // Circular Motion
  radius?: number;
  speed?: number;
  bankingAngle?: number;
}

export interface PhysicsConstants {
  gravity: number;
  airResistance?: number;
}

export interface UnitSystem {
  length: 'm' | 'ft' | 'cm';
  mass: 'kg' | 'lb' | 'g';
  time: 's' | 'min' | 'hr';
  force: 'N' | 'lbf' | 'dyn';
  angle: 'deg' | 'rad';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'json';
  includeSteps: boolean;
  includeDiagram: boolean;
  includeCalculations: boolean;
}