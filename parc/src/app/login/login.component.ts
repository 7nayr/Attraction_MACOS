import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../Service/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute);

  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(public authService: AuthService, public router: Router) {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/admin']);
    }
  }

  public login() {
    if (this.form.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        if (this.authService.isLoggedIn) {
          // Utiliser returnUrl s'il existe, sinon rediriger vers admin
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
          console.log('Redirection après connexion vers:', returnUrl);

          this.router.navigate([returnUrl]);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.snackBar.open(
          error.error?.messages?.[0] || 'Erreur lors de la connexion',
          'Fermer',
          { duration: 5000 }
        );
        this.loading = false;
      }
    });
  }

}
