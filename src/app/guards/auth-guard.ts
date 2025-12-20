import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // Если уже на странице логина, разрешаем доступ
    if (state.url.includes('/login')) {
      return of(true);
    }

    // Если пользователь аутентифицирован, разрешаем доступ
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    // Не аутентифицирован и не на странице логина - редирект на логин
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: state.url,
        expired: true 
      },
      replaceUrl: true
    });
    return of(false);
  }
}