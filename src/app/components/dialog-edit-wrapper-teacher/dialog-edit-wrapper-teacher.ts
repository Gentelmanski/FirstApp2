import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Teacher } from '../../models/teacher';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-edit-wrapper-teacher',
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
  templateUrl: './dialog-edit-wrapper-teacher.html',
  styleUrl: './dialog-edit-wrapper-teacher.scss'
})
export class DialogEditWrapperTeacher {
    editingTeacher: Teacher;

    constructor(
      public dialogRef: MatDialogRef<DialogEditWrapperTeacher>,
      @Inject(MAT_DIALOG_DATA) public data: Teacher
    ) {
      this.editingTeacher = data ? JSON.parse(JSON.stringify(data)) : new Teacher();
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}