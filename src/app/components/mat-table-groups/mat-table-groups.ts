import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { BaseService, PaginatedResponse, SortConfig, FilterConfig } from '../../service/base-service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditWrapperGroup } from '../../components/dialog-edit-wrapper-group/dialog-edit-wrapper-group';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Group } from '../../models/groups';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mat-table-groups',
  templateUrl: 'mat-table-groups.html',
  styleUrls: ['mat-table-groups.scss'],
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
})
export class MatTableGroups implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'code', 'actions'];
  dataSource = new MatTableDataSource<Group>();

  totalItems = 0;
  pageSize = 5;
  currentPage = 0;

  currentSort: SortConfig | undefined = undefined;

  searchName: string = '';
  searchCode: string = '';

  isLoading: boolean = false;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentUser: any = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private baseService: BaseService,
    public dialog: MatDialog,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadGroups();
        } else {
          this.clearTableData();
        }
      });
  }

  ngAfterViewInit() {
    this.sort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((sort: Sort) => {
        this.currentPage = 0;

        if (sort.direction) {
          this.currentSort = {
            active: sort.active,
            direction: sort.direction as 'asc' | 'desc'
          };
        } else {
          this.currentSort = undefined;
        }

        this.loadGroups();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canEditGroup(group: Group): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  canDeleteGroup(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  canAddGroup(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadGroups();
  }

  clearSearch(field: 'name' | 'code'): void {
    switch (field) {
      case 'name':
        this.searchName = '';
        break;
      case 'code':
        this.searchCode = '';
        break;
    }
    this.currentPage = 0;
    this.loadGroups();
  }

  clearAllSearch(): void {
    this.searchName = '';
    this.searchCode = '';
    this.currentPage = 0;
    this.loadGroups();
  }

  loadGroups() {
    if (!this.authService.isAuthenticated()) {
      this.clearTableData();
      return;
    }

    this.isLoading = true;
    this.error = null;

    const pageNumber = this.currentPage + 1;

    const filterConfig: FilterConfig = {};
    if (this.searchName) {
      filterConfig.searchName = this.searchName;
    }
    if (this.searchCode) {
      filterConfig.searchCode = this.searchCode;
    }

    this.baseService.getGroupsPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Group>) => {
          this.dataSource.data = response.items;
          this.totalItems = response.meta.total_items;
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.clearTableData();
          } else {
            this.error = "Ошибка загрузки групп";
            this.showError(error.error?.error || 'Ошибка загрузки данных');
          }
          this.isLoading = false;
        }
      });
  }

  private clearTableData(): void {
    this.dataSource.data = [];
    this.totalItems = 0;
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadGroups();
  }

  getDisplayedIndex(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  addNewGroup() {
    if (!this.canAddGroup()) {
      this.showError('Недостаточно прав для добавления групп');
      return;
    }

    const dialogAddingNewGroup = this.dialog.open(DialogEditWrapperGroup, {
      width: '400px',
      data: null
    });

    dialogAddingNewGroup.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Group) => {
        if (result && result.name && result.code) {
          this.isLoading = true;
          this.baseService.addNewGroup(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.showSuccess('Группа успешно добавлена');
                this.loadGroups();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка добавления группы');
                console.error('Error adding group:', error);
              }
            });
        }
      });
  }

  editGroup(group: Group) {
    if (!this.canEditGroup(group)) {
      this.showError('Недостаточно прав для редактирования групп');
      return;
    }

    const dialogEditGroup = this.dialog.open(DialogEditWrapperGroup, {
      width: '400px',
      data: group
    });

    dialogEditGroup.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Group) => {
        if (result && result.id !== null && result.id !== undefined && result.name && result.code) {
          this.isLoading = true;
          this.baseService.updateGroup(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Данные группы обновлены');
                this.loadGroups();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка обновления группы');
                console.error('Error updating group:', error);
              }
            });
        }
      });
  }

  deleteGroup(group: Group) {
    if (!this.canDeleteGroup()) {
      this.showError('Недостаточно прав для удаления групп');
      return;
    }

    if (group.id !== null && group.id !== undefined && 
        confirm(`Удалить группу "${group.name}" (${group.code})?`)) {
      this.isLoading = true;
      this.baseService.deleteGroup(group.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Группа успешно удалена');
            this.loadGroups();
          },
          error: (error) => {
            this.isLoading = false;
            this.showError(error.error?.error || 'Ошибка удаления группы');
            console.error('Error deleting group:', error);
          }
        });
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}