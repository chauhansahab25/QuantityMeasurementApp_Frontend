export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  googleId?: string;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface HistoryRecord {
  id: number;
  operation: 'CONVERT' | 'COMPARE' | 'ADD' | 'SUBTRACT' | 'DIVIDE';
  measurementType: string;
  firstValue: number;
  firstUnit: string;
  secondValue?: number;
  secondUnit?: string;
  result?: number;
  resultString?: string;
  errorMessage?: string;
  isError: boolean;
  createdAt: string;
}

export interface HistoryResponse {
  data: HistoryRecord[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface QuantityRequest {
  firstValue: number;
  firstUnit: string;
  secondValue: number;
  secondUnit: string;
  operation: string;
  measurementType: string;
}

export interface QuantityResponse {
  result?: number;
  resultString?: string;
  isError: boolean;
  errorMessage?: string;
}

export type MeasurementType = 'LengthUnit' | 'VolumeUnit' | 'WeightUnit' | 'TemperatureUnit';
export type OperationType = 'convert' | 'compare' | 'add' | 'subtract' | 'divide';

export interface TypeConfig { id: MeasurementType; label: string; icon: string; }
export interface OpConfig   { id: OperationType;   label: string; icon: string; }

export const MEASUREMENT_TYPES: TypeConfig[] = [
  { id: 'LengthUnit',      label: 'Length',      icon: '📏' },
  { id: 'VolumeUnit',      label: 'Volume',       icon: '🧪' },
  { id: 'WeightUnit',      label: 'Weight',       icon: '⚖️' },
  { id: 'TemperatureUnit', label: 'Temperature',  icon: '🌡️' },
];

export const OPERATIONS: OpConfig[] = [
  { id: 'convert',  label: 'Convert',  icon: '🔄' },
  { id: 'compare',  label: 'Compare',  icon: '⚖️' },
  { id: 'add',      label: 'Add',      icon: '➕' },
  { id: 'subtract', label: 'Subtract', icon: '➖' },
  { id: 'divide',   label: 'Divide',   icon: '➗' },
];

export const UNITS: Record<MeasurementType, string[]> = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'POUND'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT'],
};

export const OP_ICONS: Record<string, string> = {
  CONVERT: '🔄', COMPARE: '⚖️', ADD: '➕', SUBTRACT: '➖', DIVIDE: '➗'
};

export const TYPE_ICONS: Record<string, string> = {
  LengthUnit: '📏', VolumeUnit: '🧪', WeightUnit: '⚖️', TemperatureUnit: '🌡️', Measurement: '📐'
};
