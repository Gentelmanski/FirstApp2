import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, Subject, takeUntil } from 'rxjs';
import { LoginRequest, LoginResponse, User, RegisterRequest } from '../models/user';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private logoutSubject = new Subject<void>();

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredAuthData();
  }

  private loadStoredAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('currentUser');
      
      if (token && user) {
        this.tokenSubject.next(token);
        this.currentUserSubject.next(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearAuthData();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      takeUntil(this.logoutSubject),
      tap(response => {
        this.setAuthData(response.token, response.user);
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, data).pipe(
      takeUntil(this.logoutSubject),
      tap(response => {
        this.setAuthData(response.token, response.user);
      })
    );
  }

  logout(): void {
    // Отправляем сигнал об отмене всех текущих запросов
    this.logoutSubject.next();
    
    this.clearAuthData();
    
    // Принудительно перенаправляем на страницу логина
    this.router.navigate(['/login'], { 
      queryParams: { logout: true },
      replaceUrl: true
    }).then(() => {
      // После навигации принудительно перезагружаем страницу для очистки состояния
      if (isPlatformBrowser(this.platformId)) {
        // Только если не в режиме SSR
        window.location.href = '/login?logout=true';
      }
    });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      takeUntil(this.logoutSubject)
    );
  }

  refreshUserData(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUserValue();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isTeacher(): boolean {
    return this.hasRole('teacher');
  }

  isStudent(): boolean {
    return this.hasRole('student');
  }

  canEditStudent(studentId: number): boolean {
    const user = this.getCurrentUserValue();
    
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    if (user.role === 'teacher') return true;
    if (user.role === 'student') {
      return user.student_id === studentId;
    }
    
    return false;
  }

  canCreateStudent(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'admin';
  }

  canDeleteStudent(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'admin';
  }

  private setAuthData(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving auth data to storage:', error);
      }
    }
    
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        // Очищаем sessionStorage и другие хранилища
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing auth data from storage:', error);
      }
    }
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }
}