import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student';

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
  searchEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getStudentsPaginated(page: number, pageSize: number, sort?: SortConfig, filter?: FilterConfig): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());

    if (sort && sort.active && sort.direction) {
      const sortParam = sort.direction === 'desc' ? `-${sort.active}` : sort.active;
      params = params.set('sortBy', sortParam);
    }

    if (filter?.searchName) {
      params = params.set('name', filter.searchName);
    }

    if (filter?.searchSurname) {
      params = params.set('surname', filter.searchSurname);
    }

    return this.http.get<PaginatedResponse<Student>>(`${this.apiUrl}/students`, { params });
  }

  addNewStudent(student: Student): Observable<Student> {
    // Преобразуем студента в формат, который ожидает сервер
    const studentToSend = {
      name: student.name,
      surname: student.surname,
      email: student.email || '' // Убедимся, что email не undefined
    };
    
    return this.http.post<Student>(`${this.apiUrl}/students`, studentToSend);
  }

  updateStudent(student: Student): Observable<Student> {
    // Преобразуем студента в формат, который ожидает сервер
    const studentToSend = {
      name: student.name,
      surname: student.surname,
      email: student.email || ''
    };
    
    return this.http.put<Student>(`${this.apiUrl}/students/${student.id}`, studentToSend);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/students/${id}`);
  }
}