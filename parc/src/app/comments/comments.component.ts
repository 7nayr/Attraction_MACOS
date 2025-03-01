import { Component, Input, OnInit } from '@angular/core';
import { CritiqueService } from '../Service/comments.service';
import { CommonModule } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { Critique } from '../Interface/comments.interface';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-critiques',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent implements OnInit {
  attractionId?: number;

  // Tableau local de critiques pour une meilleure gestion de l'affichage
  public critiquesList: Critique[] = [];
  public critiques: Observable<Critique[]>;

  public newCritique: Critique = {
    critique_id: 0,
    note: 0,
    commentaire: '',
    attraction_id: 0,
    user_id: 1, // Utilisateur invité par défaut
  };

  constructor(
    public critiqueService: CritiqueService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.critiques = of([]); // Initialisation avec un tableau vide
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['attractionId']) {
        this.attractionId = +params['attractionId'];
        this.fetchCritiques();
      }
    });
  }

  fetchCritiques() {
    if (this.attractionId) {
      console.log(`Récupération des critiques pour l'attraction ${this.attractionId}`);

      this.critiques = this.critiqueService.getCritiquesByAttractionId(
        this.attractionId
      ).pipe(
        tap(critiques => {
          console.log('Critiques reçues:', critiques);
          this.critiquesList = critiques;
        })
      );
    } else {
      console.log('Récupération de toutes les critiques');

      this.critiques = this.critiqueService.getAllCritiques().pipe(
        tap(critiques => {
          console.log('Toutes les critiques reçues:', critiques);
          this.critiquesList = critiques;
        })
      );
    }
  }

  submitCritique() {
    if (
      this.newCritique.note === 0 ||
      !this.newCritique.commentaire ||
      !this.attractionId
    ) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    this.newCritique.attraction_id = this.attractionId;
    this.newCritique.user_id = 1; // Utilisateur invité par défaut

    console.log('Envoi de la critique:', this.newCritique);

    this.critiqueService.postCritique(this.newCritique).subscribe({
      next: (response) => {
        console.log('Réponse après ajout de critique:', response);

        this.snackBar.open('Commentaire ajouté avec succès!', 'Fermer', {
          duration: 3000,
        });

        // Ajouter manuellement la critique à la liste locale
        const newId = response.result || Date.now(); // Utiliser l'ID retourné ou un timestamp
        const addedCritique: Critique = {
          ...this.newCritique,
          critique_id: newId
        };

        // Ajouter à la liste locale pour un affichage immédiat
        this.critiquesList = [...this.critiquesList, addedCritique];

        // Reset le formulaire
        this.newCritique = {
          critique_id: 0,
          note: 0,
          commentaire: '',
          attraction_id: this.attractionId || 0,
          user_id: 1,
        };

        // Rafraîchir la liste depuis l'API après un petit délai
        setTimeout(() => this.fetchCritiques(), 500);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        this.snackBar.open(
          `Erreur lors de l'ajout du commentaire: ${error.status} ${error.message}`,
          'Fermer',
          { duration: 3000 }
        );
      },
    });
  }
}
