export interface RegisterUserRequest {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
  gitHubId?: string;
  googleId?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserInfo;
  expiresAt: string;
}

export interface QuantityMeasurementRequestDto {
  firstValue: number;
  firstUnit: string;
  secondValue: number;
  secondUnit: string;
  operation: string;  // ADD, SUBTRACT, DIVIDE, COMPARE, CONVERT
  measurementType: string; // LengthUnit, VolumeUnit, WeightUnit, TemperatureUnit
  targetUnit?: string;
}

export interface QuantityMeasurementOperationResultDto {
  result: number;
  resultString: string;
  isError: boolean;
  errorMessage?: string;
  operation: string;
  measurementType: string;
  firstValue?: number;
  firstUnit?: string;
  secondValue?: number;
  secondUnit?: string;
  targetUnit?: string;
}
