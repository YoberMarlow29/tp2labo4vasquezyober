import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RecaptchaModule } from 'ng-recaptcha';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [

    RecaptchaModule,
    provideRouter(routes),
    importProvidersFrom(NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),BrowserAnimationsModule),
    provideAnimations(),
     provideFirebaseApp(() => initializeApp({
    "projectId":"segundotplabo",
    "appId":"1:937951349338:web:c9464e0b996b5e6eec6663",
    "storageBucket":"segundotplabo.appspot.com",
    "apiKey":"AIzaSyAIeqmWSbVqWF-McCSRFC--LrZyJ2rPyWo",
    "authDomain":"segundotplabo.firebaseapp.com",
    "messagingSenderId":"937951349338"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())]
};

