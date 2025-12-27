import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Teacher } from '../../models/teacher';
import { Group } from '../../models/groups';
import { Student } from '../../models/student';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../service/base-service';

@Component({
  selector: 'app-dialog-assign-groups',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './dialog-assing-groups.html',
  styleUrl: './dialog-assing-groups.scss'
})
export class DialogAssignGroups implements OnInit {
  teacher: Teacher;
  allGroups: Group[] = [];
  filteredGroups: Group[] = [];
  selectedGroups: { [key: number]: boolean } = {};
  searchQuery: string = '';
  originalSelection: { [key: number]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<DialogAssignGroups>,
    @Inject(MAT_DIALOG_DATA) public data: { teacher: Teacher },
    private baseService: BaseService
  ) {
    this.teacher = JSON.parse(JSON.stringify(data.teacher));
    
    // Инициализируем группы если их нет
    if (!this.teacher.groups) {
      this.teacher.groups = [];
    }
    
    // Инициализируем selectedGroups из текущих групп преподавателя
    this.teacher.groups.forEach((group: Group) => {
      if (group.id) {
        this.selectedGroups[group.id] = true;
      }
    });
    
    // Сохраняем оригинальный выбор для сравнения
    this.originalSelection = { ...this.selectedGroups };
  }

  ngOnInit() {
    this.loadAllGroups();
  }

  loadAllGroups() {
    this.baseService.getGroupsPaginated(1, 1000, undefined, undefined)
      .subscribe({
        next: (response) => {
          this.allGroups = response.items;
          this.filteredGroups = [...this.allGroups];
          
          // Подгружаем студентов для каждой группы
          this.allGroups.forEach((group: Group, index: number) => {
            if (group.id) {
              this.baseService.getGroupStudents(group.id).subscribe({
                next: (students: Student[]) => {
                  this.allGroups[index].students = students;
                  if (this.filteredGroups[index]) {
                    this.filteredGroups[index].students = students;
                  }
                },
                error: (error: any) => {
                  console.error('Error loading students for group:', error);
                }
              });
            }
          });
        },
        error: (error: any) => {
          console.error('Error loading groups:', error);
        }
      });
  }

  filterGroups() {
    if (!this.searchQuery.trim()) {
      this.filteredGroups = [...this.allGroups];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredGroups = this.allGroups.filter((group: Group) => 
      group.name.toLowerCase().includes(query) ||
      group.code.toLowerCase().includes(query)
    );
  }

  onGroupSelectionChange(group: Group) {
    if (!group.id) return;
    
    if (this.selectedGroups[group.id]) {
      // Добавляем группу к преподавателю
      if (!this.teacher.groups) {
        this.teacher.groups = [];
      }
      
      // Проверяем, есть ли уже эта группа
      const exists = this.teacher.groups.find((g: Group) => g.id === group.id);
      if (!exists) {
        this.teacher.groups.push(group);
      }
    } else {
      // Удаляем группу из преподавателя
      if (this.teacher.groups) {
        this.teacher.groups = this.teacher.groups.filter((g: Group) => g.id !== group.id);
      }
    }
  }

  getSelectedGroupsCount(): number {
    return Object.values(this.selectedGroups).filter(selected => selected).length;
  }

  getSelectedGroupsList(): Group[] {
    return this.allGroups.filter((group: Group) => group.id && this.selectedGroups[group.id]);
  }

  removeGroup(group: Group) {
    if (group.id) {
      this.selectedGroups[group.id] = false;
      if (this.teacher.groups) {
        this.teacher.groups = this.teacher.groups.filter((g: Group) => g.id !== group.id);
      }
    }
  }

  hasChanges(): boolean {
    const currentKeys = Object.keys(this.selectedGroups).filter(key => this.selectedGroups[+key]);
    const originalKeys = Object.keys(this.originalSelection).filter(key => this.originalSelection[+key]);
    
    // Сравниваем массивы ключей
    if (currentKeys.length !== originalKeys.length) return true;
    
    return !currentKeys.every(key => originalKeys.includes(key)) ||
           !originalKeys.every(key => currentKeys.includes(key));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Возвращаем обновленного преподавателя с группами
    this.dialogRef.close(this.teacher);
  }
}