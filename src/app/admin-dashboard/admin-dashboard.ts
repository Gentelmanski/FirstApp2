import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { BaseService, PaginatedResponse, SortConfig, FilterConfig } from '../service/base-service';
import { AuthService } from '../service/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Student } from '../models/student';
import { Teacher } from '../models/teacher';
import { DialogEditWrapper } from '../components/student-edior/dialog-edit-wrapper/dialog-edit-wrapper';
import { DialogEditWrapperTeacher } from '../components/dialog-edit-wrapper-teacher/dialog-edit-wrapper-teacher';
import { Subject, takeUntil } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Group } from '../models/groups';
import { DialogEditWrapperGroup } from '../components/dialog-edit-wrapper-group/dialog-edit-wrapper-group';
import { DialogAssignGroups } from '../components/dialog-assing-groups/dialog-assing-groups';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: 'admin-dashboard.html',
  styleUrls: ['admin-dashboard.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule
  ],
})
export class AdminDashboard implements AfterViewInit, OnInit, OnDestroy {
  // Для студентов
  studentsDisplayedColumns: string[] = ['position', 'name', 'surname', 'email', 'actions'];
  studentsDataSource = new MatTableDataSource<Student>();
  studentsTotalItems = 0;
  studentsPageSize = 5;
  studentsCurrentPage = 0;
  studentsCurrentSort: SortConfig | undefined = undefined;
  searchStudentName: string = '';
  searchStudentSurname: string = '';
  searchStudentEmail: string = '';
  isLoadingStudents: boolean = false;
  studentsError: string | null = null;

  // Для преподавателей
  teachersDisplayedColumns: string[] = ['position', 'name', 'surname', 'email', 'phone', 'groups', 'actions'];
  teachersDataSource = new MatTableDataSource<Teacher>();
  teachersTotalItems = 0;
  teachersPageSize = 5;
  teachersCurrentPage = 0;
  teachersCurrentSort: SortConfig | undefined = undefined;
  searchTeacherName: string = '';
  searchTeacherSurname: string = '';
  searchTeacherEmail: string = '';
  searchTeacherPhone: string = '';
  isLoadingTeachers: boolean = false;
  teachersError: string | null = null;

  // Для групп
  groupsDisplayedColumns: string[] = ['position', 'name', 'code', 'actions'];
  groupsDataSource = new MatTableDataSource<Group>();
  groupsTotalItems = 0;
  groupsPageSize = 5;
  groupsCurrentPage = 0;
  groupsCurrentSort: SortConfig | undefined = undefined;
  searchGroupName: string = '';
  searchGroupCode: string = '';
  isLoadingGroups: boolean = false;
  groupsError: string | null = null;

  @ViewChild('groupsPaginator') groupsPaginator!: MatPaginator;
  @ViewChild('groupsSort') groupsSort!: MatSort;

  @ViewChild('studentsPaginator') studentsPaginator!: MatPaginator;
  @ViewChild('studentsSort') studentsSort!: MatSort;
  @ViewChild('teachersPaginator') teachersPaginator!: MatPaginator;
  @ViewChild('teachersSort') teachersSort!: MatSort;

  currentUser: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private baseService: BaseService,
    public dialog: MatDialog,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadStudents();
          this.loadTeachers();
        } else {
          this.clearTableData();
        }
      });
  }

  ngAfterViewInit() {
    // Студенты
    this.studentsSort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((sort: Sort) => {
        this.studentsCurrentPage = 0;
        if (sort.direction) {
          this.studentsCurrentSort = {
            active: sort.active,
            direction: sort.direction as 'asc' | 'desc'
          };
        } else {
          this.studentsCurrentSort = undefined;
        }
        this.loadStudents();
      });

    // Преподаватели
    this.teachersSort.sortChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((sort: Sort) => {
        this.teachersCurrentPage = 0;
        if (sort.direction) {
          this.teachersCurrentSort = {
            active: sort.active,
            direction: sort.direction as 'asc' | 'desc'
          };
        } else {
          this.teachersCurrentSort = undefined;
        }
        this.loadTeachers();
      });

    this.groupsSort.sortChange
  .pipe(takeUntil(this.destroy$))
  .subscribe((sort: Sort) => {
    this.groupsCurrentPage = 0;
    if (sort.direction) {
      this.groupsCurrentSort = {
        active: sort.active,
        direction: sort.direction as 'asc' | 'desc'
      };
    } else {
      this.groupsCurrentSort = undefined;
    }
    this.loadGroups();
  });  
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Методы для студентов
  onStudentsSearchChange(): void {
    this.studentsCurrentPage = 0;
    this.loadStudents();
  }

  clearStudentsSearch(field: 'name' | 'surname' | 'email'): void {
    switch (field) {
      case 'name': this.searchStudentName = ''; break;
      case 'surname': this.searchStudentSurname = ''; break;
      case 'email': this.searchStudentEmail = ''; break;
    }
    this.studentsCurrentPage = 0;
    this.loadStudents();
  }

  clearAllStudentsSearch(): void {
    this.searchStudentName = '';
    this.searchStudentSurname = '';
    this.searchStudentEmail = '';
    this.studentsCurrentPage = 0;
    this.loadStudents();
  }

  loadStudents() {
    if (!this.authService.isAuthenticated()) {
      this.clearStudentsTableData();
      return;
    }

    this.isLoadingStudents = true;
    this.studentsError = null;

    const pageNumber = this.studentsCurrentPage + 1;
    const filterConfig: FilterConfig = {};
    
    if (this.searchStudentName) filterConfig.searchName = this.searchStudentName;
    if (this.searchStudentSurname) filterConfig.searchSurname = this.searchStudentSurname;
    if (this.searchStudentEmail) filterConfig.searchEmail = this.searchStudentEmail;

    this.baseService.getStudentsPaginated(pageNumber, this.studentsPageSize, this.studentsCurrentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Student>) => {
          this.studentsDataSource.data = response.items;
          this.studentsTotalItems = response.meta.total_items;
          this.isLoadingStudents = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.clearStudentsTableData();
          } else {
            this.studentsError = "Ошибка загрузки студентов";
            this.showError(error.error?.error || 'Ошибка загрузки данных студентов');
          }
          this.isLoadingStudents = false;
        }
      });
  }

  onStudentsPageChange(event: PageEvent) {
    this.studentsCurrentPage = event.pageIndex;
    this.studentsPageSize = event.pageSize;
    this.loadStudents();
  }

  getStudentsDisplayedIndex(index: number): number {
    return this.studentsCurrentPage * this.studentsPageSize + index + 1;
  }

  addNewStudent() {
    const dialogAddingNewStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: null
    });

    dialogAddingNewStudent.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Student) => {
        if (result && result.name && result.surname) {
          this.isLoadingStudents = true;
          this.baseService.addNewStudent(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.showSuccess('Студент успешно добавлен');
                this.loadStudents();
              },
              error: (error) => {
                this.isLoadingStudents = false;
                this.showError(error.error?.error || 'Ошибка добавления студента');
              }
            });
        }
      });
  }

  editStudent(student: Student) {
    const dialogEditStudent = this.dialog.open(DialogEditWrapper, {
      width: '400px',
      data: student
    });

    dialogEditStudent.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Student) => {
        if (result && result.id !== null && result.id !== undefined && result.name && result.surname) {
          this.isLoadingStudents = true;
          this.baseService.updateStudent(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Данные студента обновлены');
                this.loadStudents();
              },
              error: (error) => {
                this.isLoadingStudents = false;
                this.showError(error.error?.error || 'Ошибка обновления студента');
              }
            });
        }
      });
  }

  deleteStudent(student: Student) {
    if (student.id !== null && student.id !== undefined && 
        confirm(`Удалить студента ${student.name} ${student.surname}?`)) {
      this.isLoadingStudents = true;
      this.baseService.deleteStudent(student.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Студент успешно удален');
            this.loadStudents();
          },
          error: (error) => {
            this.isLoadingStudents = false;
            this.showError(error.error?.error || 'Ошибка удаления студента');
          }
        });
    }
  }

  // Методы для преподавателей
  onTeachersSearchChange(): void {
    this.teachersCurrentPage = 0;
    this.loadTeachers();
  }

  clearTeachersSearch(field: 'name' | 'surname' | 'email' | 'phone'): void {
    switch (field) {
      case 'name': this.searchTeacherName = ''; break;
      case 'surname': this.searchTeacherSurname = ''; break;
      case 'email': this.searchTeacherEmail = ''; break;
      case 'phone': this.searchTeacherPhone = ''; break;
    }
    this.teachersCurrentPage = 0;
    this.loadTeachers();
  }

  clearAllTeachersSearch(): void {
    this.searchTeacherName = '';
    this.searchTeacherSurname = '';
    this.searchTeacherEmail = '';
    this.searchTeacherPhone = '';
    this.teachersCurrentPage = 0;
    this.loadTeachers();
  }

  loadTeachers() {
    if (!this.authService.isAuthenticated()) {
      this.clearTeachersTableData();
      return;
    }

    this.isLoadingTeachers = true;
    this.teachersError = null;

    const pageNumber = this.teachersCurrentPage + 1;
    const filterConfig: FilterConfig = {};
    
    if (this.searchTeacherName) filterConfig.searchName = this.searchTeacherName;
    if (this.searchTeacherSurname) filterConfig.searchSurname = this.searchTeacherSurname;
    if (this.searchTeacherEmail) filterConfig.searchEmail = this.searchTeacherEmail;

    this.baseService.getTeachersPaginated(pageNumber, this.teachersPageSize, this.teachersCurrentSort, filterConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Teacher>) => {
          this.teachersDataSource.data = response.items;
          this.teachersTotalItems = response.meta.total_items;
          this.isLoadingTeachers = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.clearTeachersTableData();
          } else {
            this.teachersError = "Ошибка загрузки преподавателей";
            this.showError(error.error?.error || 'Ошибка загрузки данных преподавателей');
          }
          this.isLoadingTeachers = false;
        }
      });
  }

  onTeachersPageChange(event: PageEvent) {
    this.teachersCurrentPage = event.pageIndex;
    this.teachersPageSize = event.pageSize;
    this.loadTeachers();
  }

  getTeachersDisplayedIndex(index: number): number {
    return this.teachersCurrentPage * this.teachersPageSize + index + 1;
  }

  addNewTeacher() {
    const dialogAddingNewTeacher = this.dialog.open(DialogEditWrapperTeacher, {
      width: '400px',
      data: null
    });

    dialogAddingNewTeacher.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Teacher) => {
        if (result && result.name && result.surname && result.email) {
          this.isLoadingTeachers = true;
          this.baseService.addNewTeacher(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                this.showSuccess('Преподаватель успешно добавлен');
                this.loadTeachers();
              },
              error: (error) => {
                this.isLoadingTeachers = false;
                this.showError(error.error?.error || 'Ошибка добавления преподавателя');
              }
            });
        }
      });
  }

  editTeacher(teacher: Teacher) {
    const dialogEditTeacher = this.dialog.open(DialogEditWrapperTeacher, {
      width: '400px',
      data: teacher
    });

    dialogEditTeacher.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Teacher) => {
        if (result && result.id !== null && result.id !== undefined && result.name && result.surname && result.email) {
          this.isLoadingTeachers = true;
          this.baseService.updateTeacher(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.showSuccess('Данные преподавателя обновлены');
                this.loadTeachers();
              },
              error: (error) => {
                this.isLoadingTeachers = false;
                this.showError(error.error?.error || 'Ошибка обновления преподавателя');
              }
            });
        }
      });
  }

  deleteTeacher(teacher: Teacher) {
    if (teacher.id !== null && teacher.id !== undefined && 
        confirm(`Удалить преподавателя ${teacher.name} ${teacher.surname}?`)) {
      this.isLoadingTeachers = true;
      this.baseService.deleteTeacher(teacher.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Преподаватель успешно удален');
            this.loadTeachers();
          },
          error: (error) => {
            this.isLoadingTeachers = false;
            this.showError(error.error?.error || 'Ошибка удаления преподавателя');
          }
        });
    }
  }

  private clearStudentsTableData(): void {
    this.studentsDataSource.data = [];
    this.studentsTotalItems = 0;
    this.studentsCurrentPage = 0;
    if (this.studentsPaginator) {
      this.studentsPaginator.firstPage();
    }
  }

  private clearTeachersTableData(): void {
    this.teachersDataSource.data = [];
    this.teachersTotalItems = 0;
    this.teachersCurrentPage = 0;
    if (this.teachersPaginator) {
      this.teachersPaginator.firstPage();
    }
  }

  private clearTableData(): void {
    this.clearStudentsTableData();
    this.clearTeachersTableData();
    this.clearGroupsTableData();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Методы для групп
onGroupsSearchChange(): void {
  this.groupsCurrentPage = 0;
  this.loadGroups();
}

clearGroupsSearch(field: 'name' | 'code'): void {
  switch (field) {
    case 'name': this.searchGroupName = ''; break;
    case 'code': this.searchGroupCode = ''; break;
  }
  this.groupsCurrentPage = 0;
  this.loadGroups();
}

clearAllGroupsSearch(): void {
  this.searchGroupName = '';
  this.searchGroupCode = '';
  this.groupsCurrentPage = 0;
  this.loadGroups();
}

loadGroups() {
  if (!this.authService.isAuthenticated()) {
    this.clearGroupsTableData();
    return;
  }

  this.isLoadingGroups = true;
  this.groupsError = null;

  const pageNumber = this.groupsCurrentPage + 1;
  const filterConfig: FilterConfig = {};
  
  if (this.searchGroupName) filterConfig.searchName = this.searchGroupName;
  //if (this.searchGroupCode) filterConfig.searchCode = this.searchGroupCode;

  this.baseService.getGroupsPaginated(pageNumber, this.groupsPageSize, this.groupsCurrentSort, filterConfig)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: PaginatedResponse<Group>) => {
        this.groupsDataSource.data = response.items;
        this.groupsTotalItems = response.meta.total_items;
        this.isLoadingGroups = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.clearGroupsTableData();
        } else {
          this.groupsError = "Ошибка загрузки групп";
          this.showError(error.error?.error || 'Ошибка загрузки данных групп');
        }
        this.isLoadingGroups = false;
      }
    });
}

onGroupsPageChange(event: PageEvent) {
  this.groupsCurrentPage = event.pageIndex;
  this.groupsPageSize = event.pageSize;
  this.loadGroups();
}

getGroupsDisplayedIndex(index: number): number {
  return this.groupsCurrentPage * this.groupsPageSize + index + 1;
}

addNewGroup() {
  const dialogAddingNewGroup = this.dialog.open(DialogEditWrapperGroup, {
    width: '400px',
    data: null
  });

  dialogAddingNewGroup.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe((result: Group) => {
      if (result && result.name && result.code) {
        this.isLoadingGroups = true;
        this.baseService.addNewGroup(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.showSuccess('Группа успешно добавлена');
              this.loadGroups();
            },
            error: (error) => {
              this.isLoadingGroups = false;
              this.showError(error.error?.error || 'Ошибка добавления группы');
            }
          });
      }
    });
}

editGroup(group: Group) {
  const dialogEditGroup = this.dialog.open(DialogEditWrapperGroup, {
    width: '400px',
    data: group
  });

  dialogEditGroup.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe((result: Group) => {
      if (result && result.id !== null && result.id !== undefined && result.name && result.code) {
        this.isLoadingGroups = true;
        this.baseService.updateGroup(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Данные группы обновлены');
              this.loadGroups();
            },
            error: (error) => {
              this.isLoadingGroups = false;
              this.showError(error.error?.error || 'Ошибка обновления группы');
            }
          });
      }
    });
}

deleteGroup(group: Group) {
  if (group.id !== null && group.id !== undefined && 
      confirm(`Удалить группу ${group.name} (${group.code})?`)) {
    this.isLoadingGroups = true;
    this.baseService.deleteGroup(group.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Группа успешно удалена');
          this.loadGroups();
        },
        error: (error) => {
          this.isLoadingGroups = false;
          this.showError(error.error?.error || 'Ошибка удаления группы');
        }
      });
  }
}

private clearGroupsTableData(): void {
  this.groupsDataSource.data = [];
  this.groupsTotalItems = 0;
  this.groupsCurrentPage = 0;
  if (this.groupsPaginator) {
    this.groupsPaginator.firstPage();
  }
}

// Метод для назначения групп преподавателю
assignGroupsToTeacher(teacher: Teacher) {
  const dialogAssignGroups = this.dialog.open(DialogAssignGroups, {
    width: '600px',
    maxHeight: '80vh',
    data: { teacher }
  });

  dialogAssignGroups.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe((updatedTeacher: Teacher) => {
      if (updatedTeacher && updatedTeacher.id) {
        this.isLoadingTeachers = true;
        
        // Создаем объект для обновления с группами
        const teacherToUpdate = {
          ...updatedTeacher,
          groups: updatedTeacher.groups || []
        };

        this.baseService.updateTeacher(teacherToUpdate)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Группы успешно назначены преподавателю');
              this.loadTeachers();
            },
            error: (error) => {
              this.isLoadingTeachers = false;
              this.showError(error.error?.error || 'Ошибка назначения групп преподавателю');
            }
          });
      }
    });
}

}