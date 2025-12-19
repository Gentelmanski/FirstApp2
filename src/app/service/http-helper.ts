import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpHelperService {
  constructor(private http: HttpClient) {}

  // Метод для отправки запроса без автоматических заголовков
  publicRequest<T>(method: string, url: string, body?: any) {
    const options = {
      headers: {
        // Явно удаляем заголовок Authorization для публичных запросов
        Authorization: ''
      }
    };
    
    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get<T>(url, options);
      case 'post':
        return this.http.post<T>(url, body, options);
      case 'put':
        return this.http.put<T>(url, body, options);
      case 'delete':
        return this.http.delete<T>(url, options);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}