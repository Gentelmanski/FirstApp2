import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentEdior } from './components/student-edior/student-edior';
import { RouterOutlet } from '@angular/router';
// import { TableStudents } from "./components/table-students/table-students";
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './service/in-memory-data';
// import { TablePaginationExample } from "./mat-table-students/mat-table-students";
import { MatIconModule } from '@angular/material/icon';
import { MatTableStudents } from "./mat-table-students/mat-table-students";

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [FormsModule,
    CommonModule,
    // TableStudents,
    MatDialogModule,
    //BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    //StudentEdior,
    HttpClientModule, MatTableStudents],

  templateUrl: './app.html',

  styleUrl: './app.scss'
})

export class App {
  //protected readonly title = signal('firstAPP');
  //name = "name";
}
