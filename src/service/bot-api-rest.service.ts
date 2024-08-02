import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotApiRestService {

  private apiUrl = 'https://bot-ia-back.onrender.com/analisa_texto';

  constructor(private http: HttpClient) {}

  enviarMensagem(mensagem: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { texto: mensagem });
  }

}
