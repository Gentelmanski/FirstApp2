import { Injectable } from '@angular/core';
import { Student } from '../models/student';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private baseUrl = 'https://2b8ebcded7ca3c25.mokky.dev';
  private studentsUrl = `${this.baseUrl}/students`;

  constructor(
    private http: HttpClient) { }

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.studentsUrl);
  }

  addNewStudent(student: Student): Observable<Student> {
    console.log('addNewStudent');
    return this.http.post<Student>(this.studentsUrl, student).pipe();
  }

  updateStudent(student: Student): Observable<Student>{
    return this.http.patch<Student>(`${this.studentsUrl}/${student.id}`, student);
  }

  deleteStudent(id :number): Observable<any>{
    return this.http.delete(`${this.studentsUrl}/${id}`);
  }

  //Доп метод для получения студента по id
  getStudentById(id : number): Observable<Student>{
    return this.http.get<Student>(`${this.studentsUrl}/${id}`);
  }

}
