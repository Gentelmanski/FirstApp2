import { Injectable } from '@angular/core';
import { Student } from '../models/student';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Интерфейс для ответа с пагинацией
export interface PaginatedResponse<T> {
  meta: {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    remaining_count: number;
  };
  items: T[];
}

// Интерфейс для конфигурации сортировки
export interface SortConfig {
  active: string;
  direction: 'asc' | 'desc';
}

// Интерфейс для конфигурации фильтрации
export interface FilterConfig {
  searchName?: string;
  searchSurname?: string;
  searchEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = 'http://localhost:8080/api';
  private studentsUrl = `${this.baseUrl}/students`;

  constructor(private http: HttpClient) { }

  // Получение списка студентов с пагинацией, сортировкой и фильтрацией
  getStudentsPaginated(
    page: number,
    limit: number = 5,
    sortConfig?: SortConfig,
    filterConfig?: FilterConfig
  ): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Добавление параметра сортировки
    if (sortConfig && sortConfig.active) {
      const sortBy = sortConfig.direction === 'desc' ? `-${sortConfig.active}` : sortConfig.active;
      params = params.set('sortBy', sortBy);
    }

    // Добавление параметров поиска
    if (filterConfig?.searchName) {
      params = params.set('name', `*${filterConfig.searchName}*`);
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