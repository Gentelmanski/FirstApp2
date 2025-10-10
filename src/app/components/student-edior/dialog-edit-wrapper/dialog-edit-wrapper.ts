import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Student } from '../../../models/student';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../../service/base-service';

@Component({
  selector: 'app-dialog-edit-wrapper',
  standalone: true,
  imports: [
  MatFormFieldModule,
  MatInputModule,
  FormsModule,
  MatDialogModule],
  templateUrl: './dialog-edit-wrapper.html',
  styleUrl: './dialog-edit-wrapper.scss'
})

export class DialogEditWrapper {
    editingStudent:Student

    constructor(public dialogRef: MatDialogRef<DialogEditWrapper>,
    @Inject(MAT_DIALOG_DATA) public data: Student) {
      // this.editingStudent = new Student();
      this.editingStudent = data ? Object.assign(new Student(), data) : new Student();
      // //Создаем копию объекта для редактирования
      // this.editingStudent = data ? {...data} : new Student();
    }

    ngOnInit():void{}

    onNoClick(): void{
      this.dialogRef.close();
    }
}
