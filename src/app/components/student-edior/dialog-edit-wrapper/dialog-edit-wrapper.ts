import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Student } from '../../../models/student';
import { Group } from '../../../models/groups';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../../service/base-service';
import { AuthService } from '../../../service/auth';

@Component({
  selector: 'app-dialog-edit-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './dialog-edit-wrapper.html',
  styleUrl: './dialog-edit-wrapper.scss'
})
export class DialogEditWrapper implements OnInit {
  editingStudent: Student;
  allGroups: Group[] = [];
  isAdmin: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogEditWrapper>,
    @Inject(MAT_DIALOG_DATA) public data: Student,
    private baseService: BaseService,
    private authService: AuthService
  ) {
    this.editingStudent = data ? JSON.parse(JSON.stringify(data)) : new Student();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    if (this.isAdmin) {
      this.loadAllGroups();
    }
  }

  loadAllGroups() {
    this.baseService.getGroupsPaginated(1, 1000, undefined, undefined)
      .subscribe({
        next: (response) => {
          this.allGroups = response.items;
        },
        error: (error) => {
          console.error('Error loading groups:', error);
        }
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}