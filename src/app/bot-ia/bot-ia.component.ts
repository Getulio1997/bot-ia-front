import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BotApiRestService } from './../../service/bot-api-rest.service';
import { Mensagem } from '../../model/mensagem';

@Component({
  selector: 'app-bot-ia',
  templateUrl: './bot-ia.component.html',
  styleUrls: ['./bot-ia.component.scss']
})
export class BotIaComponent implements OnInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  inputText: string = '';
  isDarkMode: boolean = false;
  isLoading: boolean = false;
  mensagens: Mensagem[] = [];

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeSetting === 'true';
    this.aplicaTema();

    const mensagensStorage = localStorage.getItem('mensagens');
    this.mensagens = mensagensStorage ? JSON.parse(mensagensStorage).map((msg: any) => new Mensagem(msg.mensagem, msg.resposta)) : [];
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 0);
  }

  corAlterado() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
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
    const mensagemFormatada = this.formatarMensagem(mensagem);
    const mensagemItem = new Mensagem(mensagemFormatada);
    this.mensagens.push(mensagemItem);
    localStorage.setItem('mensagens', JSON.stringify(this.mensagens));

    this.botApiRestService.enviarMensagem(mensagem).subscribe(
      (response) => {
        mensagemItem.resposta = this.formatarResposta(response.resposta);
        this.inputText = '';
        this.isLoading = false;
        this.scrollToBottom();
        this.ajustaAltura();

        setTimeout(() => {
          this.textarea.nativeElement.style.height = '';
        }, 100);

        localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
      },
      (error) => {
        console.error('Erro ao enviar mensagem', error);
        this.isLoading = false;
      }
    );
  }

  removeMensagem(index: number) {
    this.mensagens.splice(index, 1);
    localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
  }

  ajustaAltura() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 2 * parseFloat(getComputedStyle(textarea).fontSize))}px`;
  }

  formatarResposta(resposta: string): string {
    return resposta.replace(/\n/g, '<br>').replace(/```(.*?)```/gs, '<pre>$1</pre>');
  }

  formatarMensagem(mensagem: string): string {
    return mensagem.replace(/\n/g, '<br>').replace(/```(.*?)```/gs, '<pre>$1</pre>');
  }

}
