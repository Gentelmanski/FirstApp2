import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  let authReq = req;
  
  // Исключаем публичные маршруты из добавления токена
  const publicUrls = [
    '/api/auth/login',
    '/api/auth/register'
  ];
  
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  
  // Добавляем токен только для защищенных маршрутов
  if (token && !isPublicUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Unauthorized - очищаем данные и перенаправляем на логин
        authService.logout();
        router.navigate(['/login'], { 
          queryParams: { returnUrl: router.url },
          replaceUrl: true
        });
      } else if (error.status === 403) {
        // Forbidden
        console.error('Доступ запрещен');
        // Можно показать уведомление или редирект
        if (!router.url.includes('/login')) {
          router.navigate(['/'], { replaceUrl: true });
        }
      }
      return throwError(() => error);
    })
  );
};