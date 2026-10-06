import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-jms-pagination', standalone: true, imports: [CommonModule],
  template: `<nav *ngIf="pageCount > 1" aria-label="Phân trang" class="jms-pagination"><button type="button" (click)="pageChange.emit(page - 1)" [disabled]="page <= 1 || loading" aria-label="Trang trước"><i class="bi bi-chevron-left" aria-hidden="true"></i></button><span aria-live="polite">Trang {{ page }} / {{ pageCount }}</span><button type="button" (click)="pageChange.emit(page + 1)" [disabled]="page >= pageCount || loading" aria-label="Trang tiếp"><i class="bi bi-chevron-right" aria-hidden="true"></i></button></nav>`,
  styles: [`.jms-pagination{display:flex;align-items:center;justify-content:center;gap:1rem;margin:2rem 0}.jms-pagination button{padding:.65rem .85rem;border:1px solid var(--border-color);border-radius:.6rem;background:var(--surface-color);color:var(--text-color)}button:disabled{opacity:.45}button:focus-visible{outline:3px solid var(--focus-ring);outline-offset:3px}`]
})
export class PaginationComponent {
  @Input() page = 1; @Input() pageSize = 9; @Input() total = 0; @Input() totalPages = 0; @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
  get pageCount(): number { return this.totalPages > 0 ? this.totalPages : Math.max(1, Math.ceil(this.total / this.pageSize)); }
}
