import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Group } from '../../models/groups';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-edit-wrapper-group',
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
  templateUrl: './dialog-edit-wrapper-group.html',
  styleUrl: './dialog-edit-wrapper-group.scss'
})
export class DialogEditWrapperGroup {
  editingGroup: Group;

  constructor(
    public dialogRef: MatDialogRef<DialogEditWrapperGroup>,
    @Inject(MAT_DIALOG_DATA) public data: Group
  ) {
    this.editingGroup = data ? JSON.parse(JSON.stringify(data)) : new Group();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}