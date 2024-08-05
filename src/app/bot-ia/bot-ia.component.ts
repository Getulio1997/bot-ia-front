import { BotApiRestService } from './../../service/bot-api-rest.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-bot-ia',
  templateUrl: './bot-ia.component.html',
  styleUrls: ['./bot-ia.component.scss']
})
export class BotIaComponent implements OnInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  resposta: string = '';
  inputText: string = '';
  isDarkMode: boolean = false;

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeSetting === 'true';
    this.aplicaTema();
  }

  corAlterado() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.aplicaTema();
  }

  aplicaTema() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  enviaMensagem(mensagem: string) {
    if (!mensagem.trim()) {
      return;
    }

    this.botApiRestService.enviarMensagem(mensagem).subscribe(
      (response) => {
        this.resposta = response.resposta;
        this.inputText = '';
        this.textarea.nativeElement.value = '';
        this.ajustaAltura();
      },
      (error) => {
        console.error('Erro ao enviar mensagem', error);
      }
    );
  }

  ajustaAltura() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 2 * parseFloat(getComputedStyle(textarea).fontSize))}px`;
  }

  formatarResposta(resposta: string): string {
    return resposta.replace(/\n/g, '<br>').replace(/```(.*?)```/gs, '<pre>$1</pre>');
  }
}
