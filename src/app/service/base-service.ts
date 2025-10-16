import { Injectable } from '@angular/core';
import { Student } from '../models/student';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface SortConfig {
  active: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  searchName?: string;
  searchSurname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = 'https://2b8ebcded7ca3c25.mokky.dev';
  private studentsUrl = `${this.baseUrl}/students`;

  constructor(private http: HttpClient) { }

  // Серверная пагинация, сортировка и фильтрация
  getStudentsPaginated(
    page: number,
    limit: number = 5,
    sortConfig?: SortConfig,
    filterConfig?: FilterConfig
  ): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Добавляем параметр сортировки если он передан
    if (sortConfig && sortConfig.active) {
      const sortBy = sortConfig.direction === 'desc' ? `-${sortConfig.active}` : sortConfig.active;
      params = params.set('sortBy', sortBy);
    }

    // Добавляем параметры поиска если они переданы
    if (filterConfig?.searchName) {
      params = params.set('name', `*${filterConfig.searchName}*`);
    }
    if (filterConfig?.searchSurname) {
      params = params.set('surname', `*${filterConfig.searchSurname}*`);
    }

    return this.http.get<PaginatedResponse<Student>>(this.studentsUrl, { params });
  }

  addNewStudent(student: Student): Observable<Student> {
    return this.http.post<Student>(this.studentsUrl, student);
  }

  updateStudent(student: Student): Observable<Student> {
    return this.http.patch<Student>(`${this.studentsUrl}/${student.id}`, student);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.studentsUrl}/${id}`);
  }
}
