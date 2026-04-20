import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MeasurementService } from '../../core/services/measurement.service';
import {
  MEASUREMENT_TYPES, OPERATIONS, UNITS,
  MeasurementType, OperationType, TypeConfig, OpConfig, User,
} from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  measurementTypes = MEASUREMENT_TYPES;
  operations = OPERATIONS;

  currentType: MeasurementType = 'LengthUnit';
  currentOp: OperationType = 'convert';

  form!: FormGroup;
  loading = false;
  resultText = '';
  resultIsError = false;
  showResult = false;

  user: User | null = null;
  isGuest = false;

  // Conversion factors for guest mode (same as original dashboard.js)
  private factors: Record<string, Record<string, number>> = {
    LengthUnit:  { FEET: 0.3048, INCHES: 0.0254, YARDS: 0.9144, CENTIMETERS: 0.01 },
    VolumeUnit:  { LITRE: 1, MILLILITRE: 0.001, GALLON: 3.78541 },
    WeightUnit:  { KILOGRAM: 1, GRAM: 0.001, POUND: 0.453592 },
  };

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private measurementSvc: MeasurementService,
  ) {}

  ngOnInit(): void {
    this.isGuest = this.auth.isGuest;
    this.user = this.auth.currentUser;
    if (!this.user) {
      try { this.user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* noop */ }
    }
    this.buildForm();
  }

  get units(): string[] { return UNITS[this.currentType]; }
  get isSingle(): boolean { return this.currentOp === 'convert'; }

  selectType(type: MeasurementType): void {
    this.currentType = type;
    this.showResult = false;
    this.buildForm();
  }

  selectOp(op: OperationType): void {
    this.currentOp = op;
    this.showResult = false;
    this.buildForm();
  }

  private buildForm(): void {
    const units = this.units;
    const base: Record<string, unknown> = {
      firstValue: ['', [Validators.required]],
      firstUnit:  [units[0]],
    };
    if (this.isSingle) {
      base['targetUnit'] = [units[1] || units[0]];
    } else {
      base['secondValue'] = ['', [Validators.required]];
      base['secondUnit']  = [units[0]];
    }
    this.form = this.fb.group(base);
  }

  resetForm(): void {
    this.buildForm();
    this.showResult = false;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.showResult = false;

    const { firstValue, firstUnit, secondValue, secondUnit, targetUnit } = this.form.value;
    const fv = parseFloat(firstValue);

    if (this.isGuest) {
      this.doLocalCalculation(fv, firstUnit, parseFloat(secondValue), secondUnit, targetUnit);
      return;
    }

    this.loading = true;
    const op = this.currentOp;
    const type = this.currentType;

    const baseReq = {
      firstValue: fv,
      firstUnit,
      secondValue: secondValue ? parseFloat(secondValue) : 0,
      secondUnit: secondUnit || targetUnit || firstUnit,
      operation: op.toUpperCase(),
      measurementType: type,
    };

    let obs$;
    if (op === 'convert')  obs$ = this.measurementSvc.convert(baseReq, targetUnit);
    else if (op === 'compare')  obs$ = this.measurementSvc.compare(baseReq);
    else if (op === 'add')      obs$ = this.measurementSvc.add(baseReq);
    else if (op === 'subtract') obs$ = this.measurementSvc.subtract(baseReq);
    else                        obs$ = this.measurementSvc.divide(baseReq);

    obs$.subscribe({
      next: (res) => {
        this.loading = false;
        if (res.isError) { this.setResult(res.errorMessage || 'Error', true); }
        else { this.setResult(res.resultString || String(res.result)); }
      },
      error: (err) => {
        this.loading = false;
        this.setResult(err.error?.errorMessage || err.message || 'Request failed', true);
      },
    });
  }

  private setResult(text: string, isError = false): void {
    this.resultText = text;
    this.resultIsError = isError;
    this.showResult = true;
  }

  // ── Guest local math (mirrors dashboard.js) ────────────────────────────────
  private toBase(value: number, unit: string, type: string): number {
    if (type === 'TemperatureUnit')
      return unit === 'CELSIUS' ? value : (value - 32) * 5 / 9;
    return value * (this.factors[type]?.[unit] ?? 1);
  }

  private fromBase(value: number, unit: string, type: string): number {
    if (type === 'TemperatureUnit')
      return unit === 'CELSIUS' ? value : value * 9 / 5 + 32;
    return value / (this.factors[type]?.[unit] ?? 1);
  }

  private doLocalCalculation(fv: number, fu: string, sv: number, su: string, target: string): void {
    const type = this.currentType;
    const b1 = this.toBase(fv, fu, type);

    if (this.currentOp === 'convert') {
      const r = this.fromBase(b1, target, type);
      this.setResult(`${fv} ${fu} = ${+r.toFixed(6)} ${target}`);
      return;
    }

    const b2 = this.toBase(sv, su, type);
    if (this.currentOp === 'compare') {
      this.setResult(Math.abs(b1 - b2) < 1e-9 ? 'Equal ✅' : 'Not Equal ❌');
    } else if (this.currentOp === 'add') {
      this.setResult(`${fv} ${fu} + ${sv} ${su} = ${+this.fromBase(b1 + b2, fu, type).toFixed(6)} ${fu}`);
    } else if (this.currentOp === 'subtract') {
      this.setResult(`${fv} ${fu} - ${sv} ${su} = ${+this.fromBase(b1 - b2, fu, type).toFixed(6)} ${fu}`);
    } else if (this.currentOp === 'divide') {
      if (b2 === 0) { this.setResult('Cannot divide by zero', true); return; }
      this.setResult(`${fv} ${fu} ÷ ${sv} ${su} = ${+(b1 / b2).toFixed(6)}`);
    }
  }

  isActiveType(t: TypeConfig): boolean { return t.id === this.currentType; }
  isActiveOp(o: OpConfig): boolean { return o.id === this.currentOp; }

  get displayName(): string {
    if (!this.user) return 'Guest';
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }

  logout(): void { this.auth.logout(); }
}
