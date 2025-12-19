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
    // Если пользователь аутентифицирован, проверяем актуальность токена
    if (this.authService.isAuthenticated()) {
      // Возвращаем true, но также можем проверить валидность токена
      return of(true);
    }

    // Not logged in - redirect to login page
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