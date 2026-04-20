import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryResponse, QuantityRequest, QuantityResponse } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  private base = `${environment.apiUrl}/quantitymeasurement`;

  constructor(private http: HttpClient) {}

  compare(req: QuantityRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(`${this.base}/compare`, req);
  }

  convert(req: QuantityRequest, targetUnit: string): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.base}/convert?targetUnit=${encodeURIComponent(targetUnit)}`, req);
  }

  add(req: QuantityRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(`${this.base}/add`, req);
  }

  subtract(req: QuantityRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(`${this.base}/subtract`, req);
  }

  divide(req: QuantityRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(`${this.base}/divide`, req);
  }

  getHistory(page: number, pageSize: number, operation = '', measurementType = ''): Observable<HistoryResponse> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (operation)       params = params.set('operation', operation);
    if (measurementType) params = params.set('measurementType', measurementType);
    return this.http.get<HistoryResponse>(`${this.base}/history`, { params });
  }

  clearHistory(): Observable<unknown> {
    return this.http.delete(`${this.base}/history`);
  }
}
