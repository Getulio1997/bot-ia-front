import { Injectable } from '@angular/core';
import { Mensagem } from '../model/mensagem';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotApiRestService {

  private apiUrl = 'http://localhost:8000/analisa_texto';

  constructor(private http: HttpClient) {}

  enviarMensagem(mensagem: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { texto: mensagem });
  }

}
