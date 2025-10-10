import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { InMemoryDataService } from './service/in-memory-data';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api'
//import "zone.js"
import {provideAnimations} from '@angular/platform-browser/animations'

export const appConfig: ApplicationConfig = {
  providers: [
    // provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(),
    // provideRouter(routes),
    // provideClientHydration(withEventReplay()),
    // provideHttpClient(withFetch()),
    // provideAnimations(),
    // importProvidersFrom([HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService)])
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideRouter([])
  ]


};
