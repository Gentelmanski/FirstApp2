import { Injectable } from '@angular/core';
import { Student } from '../models/student';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = 'https://2b8ebcded7ca3c25.mokky.dev';
  private studentsUrl = `${this.baseUrl}/students`;

  constructor(private http: HttpClient) { }

  // Серверная пагинация согласно документации mokky.dev
  getStudentsPaginated(page: number, limit: number = 5): Observable<PaginatedResponse<Student>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

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
