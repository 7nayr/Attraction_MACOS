import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from './data.service';
import { Critique } from '../Interface/comments.interface';
import { MessageInterface } from '../Interface/message.interface';

@Injectable({
  providedIn: 'root',
})
export class CritiqueService {
  constructor(private dataService: DataService) {}

  public getAllCritiques(): Observable<Critique[]> {
    const url = 'http://127.0.0.1:5006/critique';
    const data = this.dataService.getData(url);
    return data as Observable<Critique[]>;
  }

  public getCritiquesByAttractionId(attractionId: number): Observable<Critique[]> {
    const url = `http://127.0.0.1:5006/critique/attraction/${attractionId}`;
    const data = this.dataService.getData(url);
    return data as Observable<Critique[]>;
  }

  public getCritiquesByUserId(userId: number): Observable<Critique[]> {
    const url = `http://127.0.0.1:5006/critique/user/${userId}`;
    const data = this.dataService.getData(url);
    return data as Observable<Critique[]>;
  }

  public postCritique(critique: Critique): Observable<MessageInterface> {
    const url = 'http://127.0.0.1:5006/critique';
    const payload = {
      note: critique.note,
      commentaire: critique.commentaire,
      attraction_id: critique.attraction_id,
      user_id: critique.user_id,
    };
    return this.dataService.postData(url, payload) as Observable<MessageInterface>;
  }

  public deleteCritique(critiqueId: number): Observable<MessageInterface> {
    const url = `http://127.0.0.1:5006/critique/${critiqueId}`;
    const data = this.dataService.deleteData(url);
    return data as Observable<MessageInterface>;
  }
}
