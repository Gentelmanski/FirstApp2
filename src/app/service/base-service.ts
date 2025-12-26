import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/student';
import { Teacher } from '../models/teacher';
import { Group } from '../models/groups';

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
  searchCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Студенты
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

    if (filter?.searchEmail) {
      params = params.set('email', filter.searchEmail);
    }

    return this.http.get<PaginatedResponse<Student>>(`${this.apiUrl}/students`, { params });
  }

  addNewStudent(student: Student): Observable<Student> {
    const studentToSend = {
      name: student.name,
      surname: student.surname,
      email: student.email || ''
    };
    
    return this.http.post<Student>(`${this.apiUrl}/students`, studentToSend);
  }

  updateStudent(student: Student): Observable<Student> {
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

  // Преподаватели
  getTeachersPaginated(page: number, pageSize: number, sort?: SortConfig, filter?: FilterConfig): Observable<PaginatedResponse<Teacher>> {
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

    if (filter?.searchEmail) {
      params = params.set('email', filter.searchEmail);
    }

    return this.http.get<PaginatedResponse<Teacher>>(`${this.apiUrl}/teachers`, { params });
  }

  addNewTeacher(teacher: Teacher): Observable<Teacher> {
    const teacherToSend = {
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email,
      phone: teacher.phone || ''
    };
    
    return this.http.post<Teacher>(`${this.apiUrl}/teachers`, teacherToSend);
  }

  updateTeacher(teacher: Teacher): Observable<Teacher> {
    const teacherToSend = {
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email,
      phone: teacher.phone || ''
    };
    
    return this.http.put<Teacher>(`${this.apiUrl}/teachers/${teacher.id}`, teacherToSend);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teachers/${id}`);
  }

  getGroupsPaginated(page: number, pageSize: number, sort?: SortConfig, filter?: FilterConfig): Observable<PaginatedResponse<Group>> {
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

  if (filter?.searchCode) { 
    params = params.set('code', filter.searchCode);
  }

  return this.http.get<PaginatedResponse<Group>>(`${this.apiUrl}/groups`, { params });
}

addNewGroup(group: Group): Observable<Group> {
  const groupToSend = {
    name: group.name,
    code: group.code
  };
  
  return this.http.post<Group>(`${this.apiUrl}/groups`, groupToSend);
}

updateGroup(group: Group): Observable<Group> {
  const groupToSend = {
    name: group.name,
    code: group.code
  };
  
  return this.http.put<Group>(`${this.apiUrl}/groups/${group.id}`, groupToSend);
}

deleteGroup(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/groups/${id}`);
}

}