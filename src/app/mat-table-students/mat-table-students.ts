import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { BaseService, PaginatedResponse, SortConfig, FilterConfig } from '../service/base-service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditWrapper } from '../components/student-edior/dialog-edit-wrapper/dialog-edit-wrapper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Student } from '../models/student';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../service/auth';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mat-table-students',
  templateUrl: 'mat-table-students.html',
  styleUrls: ['mat-table-students.scss'],
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
export class MatTableStudents implements AfterViewInit, OnInit, OnDestroy {
  displayedColumns: string[] = ['position', 'name', 'surname', 'email', 'actions'];
  dataSource = new MatTableDataSource<Student>();

  totalItems = 0;
  pageSize = 5;
  currentPage = 0;

  currentSort: SortConfig | undefined = undefined;

  searchName: string = '';
  searchSurname: string = '';
  searchEmail: string = '';

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
        this.updateDisplayedColumns();
        if (user) {
          this.loadStudents();
        } else {
          // Очищаем данные при выходе
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

        this.loadStudents();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDisplayedColumns(): void {
    const baseColumns = ['position', 'name', 'surname'];
    
    if (this.authService.isAdmin() || this.authService.isTeacher()) {
      baseColumns.push('email');
    }
    
    if (this.authService.isAdmin() || this.authService.isTeacher() || this.authService.isStudent()) {
      baseColumns.push('actions');
    }
    
    this.displayedColumns = baseColumns;
  }

  canEditStudent(student: Student): boolean {
    return this.authService.canEditStudent(student.id || 0);
  }

  canDeleteStudent(): boolean {
    return this.authService.canDeleteStudent();
  }

  canAddStudent(): boolean {
    return this.authService.canCreateStudent();
  }

  onSearchChange(): void {
    this.currentPage = 0;
    this.loadStudents();
  }

  clearSearch(field: 'name' | 'surname' | 'email'): void {
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
    }
    this.currentPage = 0;
    this.loadStudents();
  }

  clearAllSearch(): void {
    this.searchName = '';
    this.searchSurname = '';
    this.searchEmail = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  loadStudents() {
    // Не загружаем если нет пользователя
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

    this.baseService.getStudentsPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Student>) => {
          this.dataSource.data = response.items;
          this.totalItems = response.meta.total_items;
          this.isLoading = false;
        },
        error: (error) => {
          // Если ошибка 401 (Unauthorized) - это нормально при выходе
          if (error.status === 401) {
            this.clearTableData();
          } else {
            this.error = "Ошибка загрузки студентов";
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
    this.loadStudents();
  }

  getDisplayedIndex(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  addNewStudent() {
    if (!this.canAddStudent()) {
      this.showError('Недостаточно прав для добавления студентов');
      return;
    }

    const dialogAddingNewStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: null
    });

    dialogAddingNewStudent.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Student) => {
        if (result && result.name && result.surname) {
          this.isLoading = true;
          this.baseService.addNewStudent(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.showSuccess('Студент успешно добавлен');
                this.loadStudents();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка добавления студента');
                console.error('Error adding student:', error);
              }
            });
        }
      });
  }

  editStudent(student: Student) {
    if (!this.canEditStudent(student)) {
      this.showError('Вы можете редактировать только свои данные');
      return;
    }

    const dialogEditStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: student
    });

    dialogEditStudent.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Student) => {
        if (result && result.id !== null && result.id !== undefined && result.name && result.surname) {
          this.isLoading = true;
          this.baseService.updateStudent(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Данные студента обновлены');
                this.loadStudents();
              },
              error: (error) => {
                this.isLoading = false;
                this.showError(error.error?.error || 'Ошибка обновления студента');
                console.error('Error updating student:', error);
              }
            });
        }
      });
  }

  deleteStudent(student: Student) {
    if (!this.canDeleteStudent()) {
      this.showError('Недостаточно прав для удаления студентов');
      return;
    }

    if (student.id !== null && student.id !== undefined && 
        confirm(`Удалить студента ${student.name} ${student.surname}?`)) {
      this.isLoading = true;
      this.baseService.deleteStudent(student.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Студент успешно удален');
            this.loadStudents();
          },
          error: (error) => {
            this.isLoading = false;
            this.showError(error.error?.error || 'Ошибка удаления студента');
            console.error('Error deleting student:', error);
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