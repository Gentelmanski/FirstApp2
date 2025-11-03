import { Injectable } from '@angular/core';
import { Student } from '../models/student';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Интерфейс для ответа с пагинацией
export interface PaginatedResponse<T> {
  meta: {
    total_items: number;    // Общее количество элементов
    total_pages: number;    // Общее количество страниц
    current_page: number;   // Текущая страница
    per_page: number;       // Количество элементов на странице
    remaining_count: number;// Оставшееся количество элементов
  };
  items: T[]; // Массив элементов текущей страницы
}

// Интерфейс для конфигурации сортировки
export interface SortConfig {
  active: string;          // Поле для сортировки
  direction: 'asc' | 'desc'; // Направление сортировки
}

// Интерфейс для конфигурации фильтрации
export interface FilterConfig {
  searchName?: string;    // Фильтр по имени
  searchSurname?: string; // Фильтр по фамилии
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = 'http://localhost:8080/api'; // Базовый URL API
  //как было до перехода на свой бэк private baseUrl = 'https://2b8ebcded7ca3c25.mokky.dev'; // Базовый URL API
  private studentsUrl = `${this.baseUrl}/students`;       // URL для работы со студентами

  constructor(private http: HttpClient) { }

  // Получение списка студентов с пагинацией, сортировкой и фильтрацией
  getStudentsPaginated(
    page: number,           // Номер страницы (начиная с 1)
    limit: number = 5,      // Количество элементов на странице
    sortConfig?: SortConfig, // Конфигурация сортировки
    filterConfig?: FilterConfig // Конфигурация фильтрации
  ): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Добавление параметра сортировки если передан
    if (sortConfig && sortConfig.active) {
      const sortBy = sortConfig.direction === 'desc' ? `-${sortConfig.active}` : sortConfig.active;
      params = params.set('sortBy', sortBy);
    }

    // Добавление параметров поиска если переданы
    if (filterConfig?.searchName) {
      params = params.set('name', `*${filterConfig.searchName}*`); // Поиск с подстановочными знаками
    }
    if (filterConfig?.searchSurname) {
      params = params.set('surname', `*${filterConfig.searchSurname}*`);
    }

    return this.http.get<PaginatedResponse<Student>>(this.studentsUrl, { params });
  }

  // Добавление нового студента
  addNewStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.studentsUrl, student);
  }

  // Обновление данных студента
  updateStudent(student: Student): Observable<Student> {
    return this.http.patch<Student>(`${this.studentsUrl}/${student.id}`, student);
  }

  // Удаление студента по ID
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.studentsUrl}/${id}`);
  }
}
