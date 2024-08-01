import { BotApiRestService } from './../../service/bot-api-rest.service';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Mensagem } from '../../model/mensagem';

@Component({
  selector: 'app-bot-ia',
  templateUrl: './bot-ia.component.html',
  styleUrls: ['./bot-ia.component.scss']
})
export class BotIaComponent {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  resposta: string = '';
  inputText: string = '';

  constructor(private botApiRestService: BotApiRestService) {}

  enviaMensagem(mensagem: string): void {
    this.botApiRestService.enviarMensagem(mensagem).subscribe(
      (response) => {
        this.resposta = response.resposta;
      },
      (error) => {
        console.error('Erro ao enviar mensagem', error);
      }
    );
  }

  ajustaAltura(): void {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 2 * parseFloat(getComputedStyle(textarea).fontSize))}px`;
  }

}
