import { Student } from './../../models/student';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { Student } from '../../models/student';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../service/base-service';


@Component({
  selector: 'app-student-edior',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student-edior.html',
  styleUrl: './student-edior.scss'
})
export class StudentEdior implements OnInit{
  /*nameEditor = "";
  surnameEditor = "";*/

  editingStudent : Student;

  constructor(private baseservice : BaseService){
    this.editingStudent = new Student();

  }

ngOnInit(){}

  addStudent(): void {
    console.log(this.editingStudent, " ЭТО ТЕКСТ");
    this.baseservice.addNewStudent(this.editingStudent);
    this.editingStudent = new Student();
  }
}
