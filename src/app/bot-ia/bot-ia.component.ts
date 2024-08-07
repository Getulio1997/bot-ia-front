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
  isLoading: boolean = false;
  mensagens: string[] = [];

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeSetting === 'true';
    this.aplicaTema();

    const mensagemStorege = localStorage.getItem('mensagens');
    this.mensagens = mensagemStorege ? JSON.parse(mensagemStorege) : [];
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

    this.isLoading = true;
    const button = document.querySelector('.btn-primary');

    if (button) {
      button.classList.add('btn-loading');

      this.botApiRestService.enviarMensagem(mensagem).subscribe(
        (response) => {
          this.resposta = response.resposta;
          this.inputText = '';
          this.isLoading = false;
          this.mensagens.push(mensagem);
          localStorage.setItem('chats', JSON.stringify(this.mensagens));

          setTimeout(() => {
            button.classList.remove('btn-loading');
            button.classList.add('btn-success');

            setTimeout(() => {
              button.classList.remove('btn-success');
            }, 1250);

            this.textarea.nativeElement.value = '';
            this.ajustaAltura();
          }, 100);
        },
        (error) => {
          console.error('Erro ao enviar mensagem', error);
          this.isLoading = false;
          button.classList.remove('btn-loading');
        }
      );
    }
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
