import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../models/student';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-edit-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './dialog-edit-wrapper.html',
  styleUrl: './dialog-edit-wrapper.scss'
})
export class DialogEditWrapper {
    editingStudent: Student;

    constructor(
      public dialogRef: MatDialogRef<DialogEditWrapper>,
      @Inject(MAT_DIALOG_DATA) public data: Student
    ) {
      // Создаем копию объекта студента для редактирования
      this.editingStudent = data ? { ...data } : new Student();
    }

    ngOnInit(): void {}

    // Закрытие диалога без сохранения
    onNoClick(): void {
      this.dialogRef.close();
    }
}