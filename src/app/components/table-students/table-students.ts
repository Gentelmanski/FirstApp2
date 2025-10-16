// import { BaseService } from './../../service/base-service';
// import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
// import { Student } from '../../models/student';
// import { CommonModule } from '@angular/common';
// import { MatDialog } from '@angular/material/dialog';
// import { DialogEditWrapper } from '../student-edior/dialog-edit-wrapper/dialog-edit-wrapper';
// //import "zone.js"

// @Component({
//   selector: 'app-table-students',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './table-students.html',
//   styleUrl: './table-students.scss',
//   changeDetection: ChangeDetectionStrategy.Default,
// })
// export class TableStudents implements OnInit {
//   students: Student[];
//   isLoading: boolean = false;
//   error: string | null = null;

//   constructor(
//     private baseService: BaseService,
//     public dialog: MatDialog,
//     private cd: ChangeDetectorRef
//   ){
//     this.students = [];
//   }

//   ngOnInit() {
//     console.log("TableStudentsComponent");
//     this.baseService.getAllStudents().subscribe(data => {
//       //debugger
//       console.log(`response TableStudentsComponent: ${data}`);
//       this.students = data;
//     });
//   }

//   loadStudents(){
//     this.isLoading = true;
//     this.error = null;

//     this.baseService.getAllStudents().subscribe({
//       next: (data) => {
//         this.students = data;
//         this.isLoading = false;
//         this.cd.detectChanges();
//       },
//       error: (error) => {
//         this.error = "Ошибка загрузки студентов";
//         this.isLoading = false;
//         console.log("Error loading students:", error);
//         this.cd.detectChanges();
//       }
//     });
//   }

//   addNewStudent() {
//   const dialogAddingNewStudent = this.dialog.open(DialogEditWrapper, {
//     width: '400px',
//     data: null
//   });

//   dialogAddingNewStudent.afterClosed().subscribe((result: Student) => {
//     if (result && result.name && result.surname) {
//       console.log('Dialog result:', result);
//       this.isLoading = true;
//       this.baseService.addNewStudent(result).subscribe({
//         next: (response) => {
//           console.log('Student added successfully:', response);
//           this.loadStudents();
//         },
//         error: (error) => {
//           console.error('Full error details:', error);
//           this.error = 'Ошибка добавления студента';
//           this.isLoading = false;
//           console.error('Error adding student:', error);
//           this.cd.detectChanges();
//         }
//       });
//     }
//   });
// }
//   editStudent(student: Student) {
//     const dialogEditStudent = this.dialog.open(DialogEditWrapper, {
//       width: '400px',
//       data: student
//     });

//     dialogEditStudent.afterClosed().subscribe((result: Student) => {
//       if (result && result.id && result.name && result.surname) {
//         this.isLoading = true;
//         this.baseService.updateStudent(result).subscribe({
//           next: () => {
//             this.loadStudents();
//           },
//           error: (error) => {
//             this.error = 'Ошибка обновления студента';
//             this.isLoading = false;
//             console.error('Error updating student:', error);
//             this.cd.detectChanges();
//           }
//         });
//       }
//     });
//   }

//   deleteStudent(student: Student) {
//     if (student.id && confirm(`Удалить студента ${student.name} ${student.surname}?`)) {
//       this.isLoading = true;
//       this.baseService.deleteStudent(student.id).subscribe({
//         next: () => {
//           this.loadStudents();
//         },
//         error: (error) => {
//           this.error = 'Ошибка удаления студента';
//           this.isLoading = false;
//           console.error('Error deleting student:', error);
//           this.cd.detectChanges();
//         }
//       });
//     }
//   }
// }



