import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip'; // Добавляем

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
    MatTooltipModule // Добавляем
  ],
})
export class MatTableStudents implements AfterViewInit, OnInit {
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

  constructor(
    private baseService: BaseService,
    public dialog: MatDialog,
    public authService: AuthService, // Изменяем на public для использования в шаблоне
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateDisplayedColumns();
      this.loadStudents();
    });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sort: Sort) => {
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

  // Измененный метод - общий для всех полей поиска
  onSearchChange(): void {
    this.currentPage = 0;
    this.loadStudents();
  }

  // Универсальный метод очистки
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

    this.baseService.getStudentsPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig).subscribe({
      next: (response: PaginatedResponse<Student>) => {
        this.dataSource.data = response.items;
        this.totalItems = response.meta.total_items;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Ошибка загрузки студентов";
        this.isLoading = false;
        console.error("Error loading students:", error);
        this.showError(error.error?.error || 'Ошибка загрузки данных');
      }
    });
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

    dialogAddingNewStudent.afterClosed().subscribe((result: Student) => {
      if (result && result.name && result.surname) {
        this.isLoading = true;
        this.baseService.addNewStudent(result).subscribe({
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

    dialogEditStudent.afterClosed().subscribe((result: Student) => {
      if (result && result.id !== null && result.id !== undefined && result.name && result.surname) {
        this.isLoading = true;
        this.baseService.updateStudent(result).subscribe({
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
      this.baseService.deleteStudent(student.id).subscribe({
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