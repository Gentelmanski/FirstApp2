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
  // Колонки, отображаемые в таблице
  displayedColumns: string[] = ['position', 'name', 'surname', 'email', 'actions'];

  // Источник данных для таблицы
  dataSource = new MatTableDataSource<Student>();

  // Переменные пагинации
  totalItems = 0;        // Общее количество элементов
  pageSize = 5;          // Количество элементов на странице
  currentPage = 0;       // Текущая страница

  // Переменные сортировки
  currentSort: SortConfig | undefined = undefined;

  // Переменные поиска
  searchName: string = '';
  searchSurname: string = '';
  searchEmail: string = '';

  // Состояние загрузки и ошибки
  isLoading: boolean = false;
  error: string | null = null;

  // Ссылки на компоненты пагинации и сортировки
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Текущий пользователь
  currentUser: any = null;

  // Subject для отмены подписок при уничтожении компонента
  private destroy$ = new Subject<void>();

  constructor(
    private baseService: BaseService,
    public dialog: MatDialog,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Получаем текущего пользователя
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      
      // Обновляем колонки в зависимости от роли
      this.updateDisplayedColumns();
      
      // Загружаем студентов при инициализации компонента
      this.loadStudents();
    });
  }

  ngOnDestroy() {
    // Отменяем все подписки при уничтожении компонента
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    // Подписка на события сортировки после инициализации представления
    this.sort.sortChange.pipe(
      takeUntil(this.destroy$)
    ).subscribe((sort: Sort) => {
      this.currentPage = 0; // Сброс на первую страницу при сортировке

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

  // Обновление отображаемых колонок в зависимости от роли
  private updateDisplayedColumns(): void {
    const baseColumns = ['position', 'name', 'surname'];
    
    // Добавляем email для администраторов и преподавателей
    if (this.authService.isAdmin() || this.authService.isTeacher()) {
      baseColumns.push('email');
    }
    
    // Добавляем действия если есть права
    if (this.authService.isAdmin() || this.authService.isTeacher() || this.authService.isStudent()) {
      baseColumns.push('actions');
    }
    
    this.displayedColumns = baseColumns;
  }

  // Проверка прав на редактирование
  canEditStudent(student: Student): boolean {
    return this.authService.canEditStudent(student.id || 0);
  }

  // Проверка прав на удаление
  canDeleteStudent(): boolean {
    return this.authService.canDeleteStudent();
  }

  // Проверка прав на добавление
  canAddStudent(): boolean {
    return this.authService.canCreateStudent();
  }

  // Обработчик изменения поиска
  onSearchChange(): void {
    this.currentPage = 0;
    this.loadStudents();
  }

  // Очистка поиска
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

  // Полная очистка всех фильтров
  clearAllSearch(): void {
    this.searchName = '';
    this.searchSurname = '';
    this.searchEmail = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  // Основной метод загрузки студентов с сервера
  loadStudents() {
    // Если пользователь не аутентифицирован, не загружаем данные
    if (!this.authService.isAuthenticated()) {
      this.dataSource.data = [];
      this.totalItems = 0;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    // Серверная пагинация - page начинается с 1
    const pageNumber = this.currentPage + 1;

    // Конфигурация фильтрации
    const filterConfig: FilterConfig = {};
    if (this.searchName) {
      filterConfig.searchName = this.searchName;
    }
    if (this.searchSurname) {
      filterConfig.searchSurname = this.searchSurname;
    }

    // Запрос к серверу с пагинацией, сортировкой и фильтрацией
    this.baseService.getStudentsPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

  // Обработчик изменения страницы пагинации
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStudents();
  }

  // Метод для вычисления порядкового номера с учетом текущей страницы
  getDisplayedIndex(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  // Добавление нового студента
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

  // Редактирование студента
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

  // Удаление студента
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