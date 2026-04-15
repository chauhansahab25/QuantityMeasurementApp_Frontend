import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuantityMeasurementRequestDto, QuantityMeasurementOperationResultDto } from '../models/dto.models';

@Injectable({
  providedIn: 'root'
})
export class QuantityMeasurementService {
  private apiUrl = `${environment.apiUrl}/QuantityMeasurement`;

  constructor(private http: HttpClient) { }

  compare(data: QuantityMeasurementRequestDto): Observable<QuantityMeasurementOperationResultDto> {
    console.log('Compare API call:', `${this.apiUrl}/compare`, data);
    return this.http.post<QuantityMeasurementOperationResultDto>(`${this.apiUrl}/compare`, data);
  }

  convert(data: any, targetUnit: string): Observable<QuantityMeasurementOperationResultDto> {
    let params = new HttpParams().set('targetUnit', targetUnit);
    console.log('Convert API call:', `${this.apiUrl}/convert`, data, 'params:', { targetUnit });
    console.log('Convert request data being sent:', JSON.stringify(data));
    return this.http.post<QuantityMeasurementOperationResultDto>(`${this.apiUrl}/convert`, data, { params });
  }

  add(data: QuantityMeasurementRequestDto): Observable<QuantityMeasurementOperationResultDto> {
    console.log('Add API call:', `${this.apiUrl}/add`, data);
    console.log('Add request details:', {
      firstValue: data.firstValue,
      firstUnit: data.firstUnit,
      secondValue: data.secondValue,
      secondUnit: data.secondUnit,
      measurementType: data.measurementType
    });
    return this.http.post<QuantityMeasurementOperationResultDto>(`${this.apiUrl}/add`, data);
  }

  subtract(data: QuantityMeasurementRequestDto): Observable<QuantityMeasurementOperationResultDto> {
    console.log('Subtract API call:', `${this.apiUrl}/subtract`, data);
    return this.http.post<QuantityMeasurementOperationResultDto>(`${this.apiUrl}/subtract`, data);
  }

  divide(data: QuantityMeasurementRequestDto): Observable<QuantityMeasurementOperationResultDto> {
    console.log('Divide API call:', `${this.apiUrl}/divide`, data);
    return this.http.post<QuantityMeasurementOperationResultDto>(`${this.apiUrl}/divide`, data);
  }

  getHistory(operation?: string, measurementType?: string, page: number = 1, pageSize: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    if (operation) params = params.set('operation', operation);
    if (measurementType) params = params.set('measurementType', measurementType);

    const url = `${this.apiUrl}/history`;
    console.log('Get History API call:', url, 'params:', params.toString());
    return this.http.get<any>(url, { params });
  }

  clearHistory(): Observable<any> {
    console.log('Clear History API call:', `${this.apiUrl}/history`);
    return this.http.delete(`${this.apiUrl}/history`);
  }
}
