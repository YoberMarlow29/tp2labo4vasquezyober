import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),

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

