import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { BaseService, PaginatedResponse, SortConfig, FilterConfig } from '../../service/base-service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditWrapperTeacher } from '../../components/dialog-edit-wrapper-teacher/dialog-edit-wrapper-teacher';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Teacher } from '../../models/teacher';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mat-table-teachers',
  templateUrl: 'mat-table-teachers.html',
  styleUrls: ['mat-table-teachers.scss'],
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
export class MatTableTeachers implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'surname', 'email', 'phone', 'actions'];
  dataSource = new MatTableDataSource<Teacher>();

  totalItems = 0;
  pageSize = 5;
  currentPage = 0;

  currentSort: SortConfig | undefined = undefined;

  searchName: string = '';
  searchSurname: string = '';
  searchEmail: string = '';
  searchPhone: string = '';

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
          this.loadTeachers();
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

        this.loadTeachers();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canEditTeacher(teacher: Teacher): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  canDeleteTeacher(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  canAddTeacher(): boolean {
    const user = this.authService.getCurrentUserValue();
    return user?.role === 'admin';
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadTeachers();
  }

  clearSearch(field: 'name' | 'surname' | 'email' | 'phone'): void {
    switch (field) {
      case 'name':
        this.searchName = '';
        break;
      case 'surname':
        this.searchSurname = '';
        break;
      case 'email':
        this.searchEmail = '';
        break;
      case 'phone':
        this.searchPhone = '';
        break;
    }
    this.currentPage = 0;
    this.loadTeachers();
  }

  clearAllSearch(): void {
    this.searchName = '';
    this.searchSurname = '';
    this.searchEmail = '';
    this.searchPhone = '';
    this.currentPage = 0;
    this.loadTeachers();
  }

  loadTeachers() {
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
    if (this.searchSurname) {
      filterConfig.searchSurname = this.searchSurname;
    }
    if (this.searchEmail) {
      filterConfig.searchEmail = this.searchEmail;
    }

    this.baseService.getTeachersPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Teacher>) => {
          this.dataSource.data = response.items;
          this.totalItems = response.meta.total_items;
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.clearTableData();
          } else {
            this.error = "Ошибка загрузки преподавателей";
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
    this.loadTeachers();
  }

  getDisplayedIndex(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  addNewTeacher() {
    if (!this.canAddTeacher()) {
      this.showError('Недостаточно прав для добавления преподавателей');
      return;
    }

    const dialogAddingNewTeacher = this.dialog.open(DialogEditWrapperTeacher, {
      width: '400px',
      data: null
    });

    dialogAddingNewTeacher.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Teacher) => {
        if (result && result.name && result.surname && result.email) {
          this.isLoading = true;
          this.baseService.addNewTeacher(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.showSuccess('Преподаватель успешно добавлен');
                this.loadTeachers();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка добавления преподавателя');
                console.error('Error adding teacher:', error);
              }
            });
        }
      });
  }

  editTeacher(teacher: Teacher) {
    if (!this.canEditTeacher(teacher)) {
      this.showError('Недостаточно прав для редактирования преподавателей');
      return;
    }

    const dialogEditTeacher = this.dialog.open(DialogEditWrapperTeacher, {
      width: '400px',
      data: teacher
    });

    dialogEditTeacher.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Teacher) => {
        if (result && result.id !== null && result.id !== undefined && result.name && result.surname && result.email) {
          this.isLoading = true;
          this.baseService.updateTeacher(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Данные преподавателя обновлены');
                this.loadTeachers();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка обновления преподавателя');
                console.error('Error updating teacher:', error);
              }
            });
        }
      });
  }

  deleteTeacher(teacher: Teacher) {
    if (!this.canDeleteTeacher()) {
      this.showError('Недостаточно прав для удаления преподавателей');
      return;
    }

    if (teacher.id !== null && teacher.id !== undefined && 
        confirm(`Удалить преподавателя ${teacher.name} ${teacher.surname}?`)) {
      this.isLoading = true;
      this.baseService.deleteTeacher(teacher.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Преподаватель успешно удален');
            this.loadTeachers();
          },
          error: (error) => {
            this.isLoading = false;
            this.showError(error.error?.error || 'Ошибка удаления преподавателя');
            console.error('Error deleting teacher:', error);
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