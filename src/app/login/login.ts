import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../service/auth';
import { LoginRequest, RegisterRequest, ROLES } from '../models/user';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  registerData: RegisterRequest = {
    email: '',
    password: '',
    role: ROLES.STUDENT
  };
  
  confirmPassword = '';
  selectedTab = 0;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  logoutMessage = false;
  
  roles = [
    { value: ROLES.STUDENT, viewValue: 'Студент' },
    { value: ROLES.TEACHER, viewValue: 'Преподаватель' },
    { value: ROLES.ADMIN, viewValue: 'Администратор' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['logout']) {
          this.logoutMessage = true;
          this.showSuccess('Вы успешно вышли из системы');
          
          // Очищаем query params чтобы сообщение не показывалось при обновлении
          this.router.navigate([], {
            queryParams: {},
            replaceUrl: true
          });
        }
        
        if (params['expired']) {
          this.showError('Сессия истекла. Пожалуйста, войдите снова.');
        }
      });
    
    // При заходе на страницу логина, если есть токен, но нет пользователя, очищаем
    if (this.authService.getToken() && !this.authService.getCurrentUserValue()) {
      this.authService.clearAuthState();
      this.authService.clearStoredAuthData();
    }
    
    // Если пользователь уже авторизован, редирект на главную
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogin(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.showError('Пожалуйста, заполните все поля');
      return;
    }

    this.isLoading = true;
    
    this.authService.login(this.loginData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccess('Вход выполнен успешно!');
          
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.error?.error || 'Ошибка входа. Проверьте данные.');
        }
      });
  }

  onRegister(): void {
    if (!this.registerData.email || !this.registerData.password || !this.confirmPassword) {
      this.showError('Пожалуйста, заполните все поля');
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.showError('Пароли не совпадают');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.showError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.showError('Введите корректный email');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showSuccess('Регистрация выполнена успешно!');
          
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
        },
        error: (error) => {
          this.isLoading = false;
          this.showError(error.error?.error || 'Ошибка регистрации');
        }
      });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
}