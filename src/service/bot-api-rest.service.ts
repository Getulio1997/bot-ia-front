import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environmentProd } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BotApiRestService {

  private apiUrl = environmentProd.apiUrl;

  constructor(private http: HttpClient) {}

  enviarMensagem(mensagem: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { texto: mensagem });
  }

}
