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
    FormsModule
  ],
})
export class MatTableStudents implements AfterViewInit, OnInit {
  // Колонки, отображаемые в таблице
  displayedColumns: string[] = ['position', 'name', 'surname', 'actions'];

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

  // Состояние загрузки и ошибки
  isLoading: boolean = false;
  error: string | null = null;

  // Ссылки на компоненты пагинации и сортировки
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private baseService: BaseService, // Сервис для работы с API
    public dialog: MatDialog          // Сервис для работы с диалоговыми окнами
  ) {}

  ngOnInit() {
    // Загрузка студентов при инициализации компонента
    this.loadStudents();
  }

  ngAfterViewInit() {
    // Подписка на события сортировки после инициализации представления
    this.sort.sortChange.subscribe((sort: Sort) => {
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

  // Обработчик изменения поиска по имени
  onNameSearchChange(name: string): void {
    this.searchName = name;
    this.currentPage = 0; // Сброс на первую страницу
    this.loadStudents();
  }

  // Обработчик изменения поиска по фамилии
  onSurnameSearchChange(surname: string): void {
    this.searchSurname = surname;
    this.currentPage = 0; // Сброс на первую страницу
    this.loadStudents();
  }

  // Очистка поиска по имени
  clearNameSearch(): void {
    this.searchName = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  // Очистка поиска по фамилии
  clearSurnameSearch(): void {
    this.searchSurname = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  // Полная очистка всех фильтров
  clearAllSearch(): void {
    this.searchName = '';
    this.searchSurname = '';
    this.currentPage = 0;
    this.loadStudents();
  }

  // Основной метод загрузки студентов с сервера
  loadStudents() {
    this.isLoading = true;
    this.error = null;

    // Серверная пагинация - page начинается с 1 согласно документации mokky.dev
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
    this.baseService.getStudentsPaginated(pageNumber, this.pageSize, this.currentSort, filterConfig).subscribe({
      next: (response: PaginatedResponse<Student>) => {
        this.dataSource.data = response.items;        // Установка данных таблицы
        this.totalItems = response.meta.total_items; // Обновление общего количества
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Ошибка загрузки студентов";
        this.isLoading = false;
        console.log("Error loading students:", error);
      }
    });
  }

  // Обработчик изменения страницы пагинации
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStudents(); // Перезагрузка данных для новой страницы
  }

  // Метод для вычисления порядкового номера с учетом текущей страницы
  getDisplayedIndex(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  // Добавление нового студента через диалоговое окно
  addNewStudent() {
    const dialogAddingNewStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: null // Передача null для создания нового студента
    });

    dialogAddingNewStudent.afterClosed().subscribe((result: Student) => {
      if (result && result.name && result.surname) {
        this.isLoading = true;
        this.baseService.addNewStudent(result).subscribe({
          next: (response) => {
            console.log('Student added successfully:', response);
            this.loadStudents(); // Перезагрузка данных после добавления
          },
          error: (error) => {
            this.error = 'Ошибка добавления студента';
            this.isLoading = false;
            console.error('Error adding student:', error);
          }
        });
      }
    });
  }

  // Редактирование студента через диалоговое окно
  editStudent(student: Student) {
    const dialogEditStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: student // Передача данных студента для редактирования
    });

    dialogEditStudent.afterClosed().subscribe((result: Student) => {
      if (result && result.id && result.name && result.surname) {
        this.isLoading = true;
        this.baseService.updateStudent(result).subscribe({
          next: () => {
            this.loadStudents(); // Перезагрузка данных после обновления
          },
          error: (error) => {
            this.error = 'Ошибка обновления студента';
            this.isLoading = false;
            console.error('Error updating student:', error);
          }
        });
      }
    });
  }

  // Удаление студента с подтверждением
  deleteStudent(student: Student) {
    if (student.id && confirm(`Удалить студента ${student.name} ${student.surname}?`)) {
      this.isLoading = true;
      this.baseService.deleteStudent(student.id).subscribe({
        next: () => {
          this.loadStudents(); // Перезагрузка данных после удаления
        },
        error: (error) => {
          this.error = 'Ошибка удаления студента';
          this.isLoading = false;
          console.error('Error deleting student:', error);
        }
      });
    }
  }
}
