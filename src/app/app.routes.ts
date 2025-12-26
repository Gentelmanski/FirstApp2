import { Router, Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth-guard';
import { RoleGuard } from './guards/role-guard';
import { MatTableStudents } from './mat-table-students/mat-table-students';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
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
        data: { roles: ['teacher', 'student'] }
      },
      {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];