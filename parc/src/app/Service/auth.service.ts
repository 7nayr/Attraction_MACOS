import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Retourne si l'utilisateur est connecté
   */
  get isLoggedIn() {
    return this.loggedIn.value;
  }

  /**
   * Observable pour suivre l'état de connexion
   */
  get isLoggedIn$() {
    return this.loggedIn.asObservable();
  }

  /**
   * Vérifie si un token existe dans le localStorage
   */
  private hasToken(): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      return !!user.token; // Retourne true si le token existe
    } catch (e) {
      return false;
    }
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: {name: string, password: string}): Observable<any> {
    console.log('Login tentative avec:', credentials);

    return this.http.post<any>('http://127.0.0.1:5006/login', credentials).pipe(
      tap(response => {
        console.log('Login response:', response);

        if (response && response.token) {
          // Stockage de l'utilisateur avec son token
          const user = {
            name: response.name,
            token: response.token
          };

          localStorage.setItem('user', JSON.stringify(user));
          this.loggedIn.next(true);
          console.log('Utilisateur connecté et stocké:', user);
        } else {
          console.error('Réponse de connexion invalide:', response);
        }
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout() {
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', e);
      return null;
    }
  }
}
