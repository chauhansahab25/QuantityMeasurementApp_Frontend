import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { HistoryRecord, OP_ICONS, TYPE_ICONS } from '../../shared/models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  records: HistoryRecord[] = [];
  total = 0;
  totalPages = 1;
  currentPage = 1;
  pageSize = 15;

  filterOperation = '';
  filterType = '';

  loading = false;
  errorMsg = '';
  isGuest = false;

  opIcons = OP_ICONS;
  typeIcons = TYPE_ICONS;

  constructor(public auth: AuthService, private measurementSvc: MeasurementService) {}

  ngOnInit(): void {
    this.isGuest = this.auth.isGuest;
    if (!this.isGuest) this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.errorMsg = '';
    this.measurementSvc.getHistory(
      this.currentPage, this.pageSize, this.filterOperation, this.filterType
    ).subscribe({
      next: (res) => {
        this.records = res.data || [];
        this.total = res.total || 0;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load history: ' + (err.error?.error || err.message);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadHistory();
  }

  resetFilters(): void {
    this.filterOperation = '';
    this.filterType = '';
    this.currentPage = 1;
    this.loadHistory();
  }

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadHistory();
  }

  clearHistory(): void {
    if (!confirm('Clear ALL history? This cannot be undone.')) return;
    this.measurementSvc.clearHistory().subscribe({
      next: () => this.loadHistory(),
      error: (err) => alert('Failed to clear: ' + (err.error?.error || err.message)),
    });
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getResultUnit(r: HistoryRecord): string {
    if (r.operation === 'CONVERT')  return r.secondUnit || '';
    if (r.operation === 'ADD' || r.operation === 'SUBTRACT') return r.firstUnit || '';
    return '';
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleString();
  }

  logout(): void { this.auth.logout(); }

  get displayName(): string {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u ? `${u.firstName} ${u.lastName}`.trim() : '';
    } catch { return ''; }
  }
}
