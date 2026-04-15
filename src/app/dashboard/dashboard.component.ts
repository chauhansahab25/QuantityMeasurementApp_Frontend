import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuantityMeasurementService } from '../core/services/quantity.service';
import { QuantityMeasurementOperationResultDto, QuantityMeasurementRequestDto } from '../core/models/dto.models';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-grid">
      <!-- Guest Mode Indicator -->
      <div *ngIf="isGuest" class="guest-indicator">
        <span class="guest-badge">👤 Guest Mode</span>
        <button class="btn btn-outline btn-sm" (click)="logoutAsGuest()">Sign In</button>
      </div>
      
      <div class="glass-panel">
        <h2>New Calculation</h2>
        <form [formGroup]="calcForm" (ngSubmit)="calculate()">
          <div class="form-group">
            <label class="form-label">Measurement Type</label>
            <select class="glass-input" formControlName="measurementType" (change)="onTypeChange()">
              <option value="LengthUnit">Length</option>
              <option value="VolumeUnit">Volume</option>
              <option value="WeightUnit">Weight</option>
              <option value="TemperatureUnit">Temperature</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Operation</label>
            <select class="glass-input" formControlName="operation">
              <option value="CONVERT">Convert</option>
              <option value="COMPARE">Compare</option>
              <option value="ADD">Add</option>
              <option value="SUBTRACT">Subtract</option>
              <option value="DIVIDE">Divide</option>
            </select>
          </div>

          <div class="inputs-grid">
            <div class="form-group">
              <label class="form-label">First Value</label>
              <input type="number" class="glass-input" formControlName="firstValue">
            </div>
            <div class="form-group">
              <label class="form-label">Unit</label>
              <select class="glass-input" formControlName="firstUnit">
                <option *ngFor="let u of availableUnits" [value]="u">{{u}}</option>
              </select>
            </div>
          </div>

          <ng-container *ngIf="calcForm.get('operation')?.value !== 'CONVERT'">
            <div class="inputs-grid">
              <div class="form-group">
                <label class="form-label">Second Value</label>
                <input type="number" class="glass-input" formControlName="secondValue">
              </div>
              <div class="form-group">
                <label class="form-label">Unit</label>
                <select class="glass-input" formControlName="secondUnit">
                  <option *ngFor="let u of availableUnits" [value]="u">{{u}}</option>
                </select>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="calcForm.get('operation')?.value === 'CONVERT'">
            <div class="form-group">
              <label class="form-label">Target Unit</label>
              <select class="glass-input" formControlName="targetUnit">
                <option *ngFor="let u of availableUnits" [value]="u">{{u}}</option>
              </select>
            </div>
          </ng-container>

          <button type="submit" class="glass-button mt-4" [disabled]="calcForm.invalid || isLoading">
            {{ isLoading ? 'Calculating...' : 'Calculate' }}
          </button>
        </form>

        <div *ngIf="result" class="result-box mt-4" [class.result-error]="result.isError">
          <div *ngIf="!result.isError">
            <h3>{{ result.resultString || (result.result + ' ' + (calcForm.get('targetUnit')?.value || '')) }}</h3>
            <small class="result-details">
              Operation: {{ result.operation }} | Type: {{ result.measurementType }} | Result: {{ result.result }}
            </small>
          </div>
          <div *ngIf="result.isError">
            <p class="alert-error" style="margin:0">{{ result.errorMessage }}</p>
            <small class="result-details">
              Operation: {{ result.operation }} | Type: {{ result.measurementType }}
            </small>
          </div>
        </div>
      </div>

      <div class="glass-panel">
        <div class="history-header">
          <h2>History</h2>
          <button class="glass-button-sm" (click)="clearHistory()">Clear</button>
        </div>
        <div class="history-list">
          <div *ngIf="history.length === 0" class="empty-state">
            No history found. Try calculating something!
          </div>
          <div *ngFor="let item of history" class="history-item" [class.history-error]="item.isError">
            <div class="history-header">
              <span class="history-op">{{item.operation}}</span>
              <span class="history-action">{{getOperationDescription(item)}}</span>
            </div>
            <div class="history-main">
              <div class="history-result" *ngIf="!item.isError">
                <div class="result-main">
                  <span class="result-value">{{item.result}}</span>
                  <span class="result-unit">{{getResultUnit(item)}}</span>
                </div>
                <span class="result-string">{{item.resultString}}</span>
              </div>
              <span class="history-error-msg" *ngIf="item.isError">{{item.errorMessage}}</span>
            </div>
            <div class="history-details">
              <div class="history-inputs">
                <span class="input-detail">{{item.firstValue || '?'}} {{item.firstUnit || '?'}}</span>
                <span class="input-detail" *ngIf="item.operation !== 'CONVERT'">{{item.secondValue || '?'}} {{item.secondUnit || '?'}}</span>
                <span class="input-detail" *ngIf="item.operation === 'CONVERT'">→ {{item.result}} {{getTargetUnit(item)}}</span>
              </div>
              <small>{{item.measurementType}}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-box {
      padding: 1rem;
      border-radius: 8px;
      background: rgba(108, 99, 255, 0.1);
      border: 1px solid rgba(108, 99, 255, 0.3);
      margin-top: 1rem;
    }
    .result-box.result-error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .result-box h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary);
      font-size: 1.1rem;
    }
    .result-details {
      color: var(--text-muted);
      font-size: 0.8rem;
      opacity: 0.8;
    }
    .history-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .history-item {
      padding: 0.75rem;
      border-bottom: 1px solid var(--glass-border);
      transition: background 0.2s;
    }
    .history-item:hover {
      background: rgba(108, 99, 255, 0.05);
    }
    .history-item.history-error {
      background: rgba(239, 68, 68, 0.05);
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--glass-border);
    }
    .history-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .history-action {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-style: italic;
      max-width: 60%;
      text-align: right;
    }
    .history-op {
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      font-size: 0.8rem;
    }
    .history-res {
      color: var(--text-primary);
      font-weight: 500;
    }
    .history-result {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .result-main {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
    }
    .result-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary);
    }
    .result-unit {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .result-string {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .history-error-msg {
      color: #fca5a5;
      font-size: 0.9rem;
    }
    .history-details {
      color: var(--text-muted);
      font-size: 0.75rem;
      opacity: 0.7;
    }
    .history-inputs {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }
    .input-detail {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .input-detail:last-child {
      color: var(--primary);
      font-weight: 600;
    }
    .empty-state {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem;
      font-style: italic;
    }

    .guest-indicator {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .guest-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .btn-sm {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 6px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private qService = inject(QuantityMeasurementService);

  calcForm: FormGroup;
  isLoading = false;
  result: QuantityMeasurementOperationResultDto | null = null;
  history: QuantityMeasurementOperationResultDto[] = [];

  unitsMap: Record<string, string[]> = {
    'LengthUnit': ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
    'VolumeUnit': ['GALLON', 'LITRE', 'MILLILITRE'],
    'WeightUnit': ['KILOGRAM', 'GRAM', 'POUND'],
    'TemperatureUnit': ['FAHRENHEIT', 'CELSIUS']
  };

  availableUnits: string[] = [];

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.calcForm = this.fb.group({
      measurementType: ['LengthUnit', Validators.required],
      operation: ['CONVERT', Validators.required],
      firstValue: [0, Validators.required],
      firstUnit: ['', Validators.required],
      secondValue: [0],
      secondUnit: [''],
      targetUnit: ['']
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated or guest
    const isGuest = localStorage.getItem('guestMode') === 'true';
    const isLoggedIn = this.authService.isLoggedIn();
    
    if (!isLoggedIn && !isGuest) {
      this.router.navigate(['/home']);
      return;
    }
    
    this.onTypeChange();
    this.loadHistory();
    this.testApiConnectivity();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isGuest(): boolean {
    return localStorage.getItem('guestMode') === 'true';
  }

  logoutAsGuest(): void {
    localStorage.removeItem('guestMode');
    this.router.navigate(['/home']);
  }

  onTypeChange(): void {
    const type = this.calcForm.get('measurementType')?.value as string;
    this.availableUnits = this.unitsMap[type] ?? [];
    if (this.availableUnits.length > 0) {
      this.calcForm.patchValue({
        firstUnit: this.availableUnits[0],
        secondUnit: this.availableUnits[0],
        targetUnit: this.availableUnits[0]
      });
    }
  }

  loadHistory(): void {
    console.log('Loading history...');
    this.qService.getHistory().subscribe({
      next: (res: any) => {
        console.log('History response:', res);
        // Handle different response formats
        if (res && res.data) {
          this.history = Array.isArray(res.data) ? res.data : [];
        } else if (res && Array.isArray(res)) {
          this.history = res;
        } else {
          this.history = [];
        }
        console.log('History loaded:', this.history);
      },
      error: (err) => {
        console.error('History loading error:', err);
        this.history = [];
      }
    });
  }

  clearHistory(): void {
    this.qService.clearHistory().subscribe(() => this.loadHistory());
  }

  getTargetUnit(item: QuantityMeasurementOperationResultDto): string {
    // Try to extract target unit from resultString or use a default
    if (item.resultString) {
      const parts = item.resultString.split(' ');
      return parts[parts.length - 1] || '';
    }
    return '';
  }

  getResultUnit(item: QuantityMeasurementOperationResultDto): string {
    // Extract unit from resultString
    if (item.resultString) {
      const parts = item.resultString.split(' ');
      return parts[parts.length - 1] || '';
    }
    return '';
  }

  getOperationDescription(item: QuantityMeasurementOperationResultDto): string {
    switch (item.operation) {
      case 'CONVERT':
        return `Convert ${item.firstValue || '?'} ${item.firstUnit || '?'} to ${this.getTargetUnit(item)}`;
      case 'ADD':
        return `Add ${item.firstValue || '?'} ${item.firstUnit || '?'} + ${item.secondValue || '?'} ${item.secondUnit || '?'}`;
      case 'SUBTRACT':
        return `Subtract ${item.secondValue || '?'} ${item.secondUnit || '?'} from ${item.firstValue || '?'} ${item.firstUnit || '?'}`;
      case 'DIVIDE':
        return `Divide ${item.firstValue || '?'} ${item.firstUnit || '?'} by ${item.secondValue || '?'} ${item.secondUnit || '?'}`;
      case 'COMPARE':
        return `Compare ${item.firstValue || '?'} ${item.firstUnit || '?'} and ${item.secondValue || '?'} ${item.secondUnit || '?'}`;
      default:
        return `${item.operation} operation`;
    }
  }

  testApiConnectivity(): void {
    console.log('Testing API connectivity...');
    const testData: QuantityMeasurementRequestDto = {
      firstValue: 10,
      firstUnit: 'FEET',
      secondValue: 0,
      secondUnit: '',
      operation: 'CONVERT',
      measurementType: 'LengthUnit'
    };
    
    this.qService.convert(testData, 'INCHES').subscribe({
      next: (res) => {
        console.log('API connectivity test successful:', res);
      },
      error: (err) => {
        console.error('API connectivity test failed:', err);
      }
    });
  }

  calculate(): void {
    if (this.calcForm.invalid) return;
    
    this.isLoading = true;
    this.result = null;

    const v = this.calcForm.value as {
      firstValue: number; firstUnit: string;
      secondValue: number; secondUnit: string;
      operation: string; measurementType: string; targetUnit: string;
    };
    
    // Validate Temperature operations
    if (v.measurementType === 'TemperatureUnit' && ['ADD', 'SUBTRACT', 'DIVIDE'].includes(v.operation)) {
      this.isLoading = false;
      this.result = {
        isError: true,
        errorMessage: 'Temperature units only support CONVERT and COMPARE operations',
        result: 0,
        resultString: '',
        operation: v.operation,
        measurementType: v.measurementType
      } as QuantityMeasurementOperationResultDto;
      return;
    }
    const isConvert = v.operation === 'CONVERT';

    // Create request object without secondUnit/secondValue for convert operations
    let requestData: any;
    
    if (isConvert) {
      // For convert operations, only include required fields
      requestData = {
        firstValue: v.firstValue,
        firstUnit: v.firstUnit,
        operation: v.operation,
        measurementType: v.measurementType
      };
      console.log('Convert request data (no secondUnit):', requestData);
    } else {
      // For other operations, include all fields
      requestData = {
        firstValue: v.firstValue,
        firstUnit: v.firstUnit,
        secondValue: v.secondValue,
        secondUnit: v.secondUnit,
        operation: v.operation,
        measurementType: v.measurementType
      };
      console.log('Non-convert request data:', requestData);
    }

    const handleResult = (res: QuantityMeasurementOperationResultDto): void => {
      console.log('Handling result:', res);
      // Ensure result has required properties
      this.result = {
        ...res,
        resultString: res.resultString || `${res.result} ${v.targetUnit || ''}`,
        operation: res.operation || v.operation,
        measurementType: res.measurementType || v.measurementType,
        isError: res.isError || false
      };
      console.log('Final result object:', this.result);
      this.isLoading = false;
      this.loadHistory();
    };

    const handleError = (err: any): void => {
      console.error('Operation error:', err);
      if (err.error && typeof err.error === 'object') {
        this.result = err.error;
      } else {
        this.result = { 
          isError: true, 
          errorMessage: err.error?.message || err.message || 'An error occurred',
          result: 0,
          resultString: '',
          operation: v.operation,
          measurementType: v.measurementType
        } as QuantityMeasurementOperationResultDto;
      }
      this.isLoading = false;
    };

    if (isConvert) {
      console.log('Making convert API call with targetUnit:', v.targetUnit);
      console.log('Request object keys:', Object.keys(requestData));
      console.log('Request object JSON:', JSON.stringify(requestData));
      
      // Double-check the request data before sending
      const cleanRequest = { ...requestData };
      console.log('Clean request being sent:', cleanRequest);
      
      this.qService.convert(cleanRequest, v.targetUnit).subscribe({ 
        next: (res) => {
          console.log('Convert API response:', res);
          if (res && !res.isError) {
            console.log('Convert successful - result:', res.result, 'resultString:', res.resultString);
          } else {
            console.log('Convert failed - error:', res.errorMessage);
          }
          handleResult(res);
        }, 
        error: (err) => {
          console.error('Convert API error:', err);
          console.error('Error status:', err.status);
          console.error('Error details:', err.error);
          console.error('Full error object:', JSON.stringify(err, null, 2));
          handleError(err);
        }
      });
    } else {
      switch (v.operation) {
        case 'ADD': 
          console.log('Making ADD API call with request:', requestData);
          console.log('ADD operation units:', requestData.firstUnit, '+', requestData.secondUnit);
          this.qService.add(requestData).subscribe({ 
            next: (res) => {
              console.log('Add result:', res);
              handleResult(res);
            }, 
            error: (err) => {
              console.error('Add error:', err);
              console.error('Add error details:', JSON.stringify(err, null, 2));
              handleError(err);
            }
          }); 
          break;
        case 'SUBTRACT': 
          this.qService.subtract(requestData).subscribe({ 
            next: (res) => {
              console.log('Subtract result:', res);
              handleResult(res);
            }, 
            error: (err) => {
              console.error('Subtract error:', err);
              handleError(err);
            }
          }); 
          break;
        case 'DIVIDE': 
          this.qService.divide(requestData).subscribe({ 
            next: (res) => {
              console.log('Divide result:', res);
              handleResult(res);
            }, 
            error: (err) => {
              console.error('Divide error:', err);
              handleError(err);
            }
          }); 
          break;
        case 'COMPARE': 
          this.qService.compare(requestData).subscribe({ 
            next: (res) => {
              console.log('Compare result:', res);
              handleResult(res);
            }, 
            error: (err) => {
              console.error('Compare error:', err);
              handleError(err);
            }
          }); 
          break;
        default: this.isLoading = false;
      }
    }
  }
}
