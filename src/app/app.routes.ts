import { Router, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';
import { MatTableStudents } from './mat-table-students/mat-table-students';
import { LayoutComponent } from './components/layout/layout';
import { inject } from '@angular/core';
import { AuthService } from './service/auth';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      
      // Если пользователь уже авторизован, редирект на главную
      if (authService.isAuthenticated()) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }]
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: MatTableStudents,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'teacher', 'student'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];