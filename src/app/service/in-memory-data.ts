import { Injectable } from '@angular/core';
import { Student } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDataService {
  createDb() {
    const students = [
      {id: 0, name: 'Имя', surname: 'Фамилия'},
      {id: 1, name: 'Имя 1', surname: 'Фамилия 1'},
      {id: 2, name: 'Имя 2', surname: 'Фамилия 2'}
    ];
    return {students};
  }

    genId(students: Student[]): number {
    return students.length > 0 ?
      Math.max(...students.map(student => student.id ?? 0)) + 1 : 1;
  }
}
