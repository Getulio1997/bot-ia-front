import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BotApiRestService } from './../../service/bot-api-rest.service';
import { Mensagem } from '../../model/mensagem';

@Component({
  selector: 'app-bot-ia',
  templateUrl: './bot-ia.component.html',
  styleUrls: ['./bot-ia.component.scss'],
})
export class BotIaComponent implements OnInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  inputText: string = '';
  isDarkMode: boolean = false;
  isLoading: boolean = false;
  isCodigo: boolean = false;
  mensagens: Mensagem[] = [];
  botaoCopiar: string[] = [];

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeSetting === 'true';
    this.aplicaTema();

    const mensagensStorage = localStorage.getItem('mensagens');
    this.mensagens = mensagensStorage? JSON.parse(mensagensStorage).map((msg: any) => new Mensagem(msg.mensagem, msg.resposta)) : [];

    this.botaoCopiar = Array(this.mensagens.length).fill('Copiar Código');
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

  enviaMensagem(inputText: string, event: Event) {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }

    if (!inputText.trim()) {
      return;
    }

    this.isCodigo = this.mensagemSobreCodigo(inputText);

    if (!this.isCodigo) {
      const respostaNaoCodigo = 'Eu só comento e sugiro melhorias em código. Por favor, envie seu código.';
      this.mensagens.push(new Mensagem(inputText, respostaNaoCodigo));
      this.botaoCopiar.push('Copiar Código');
      this.inputText = '';
      localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
      localStorage.setItem('botaoCopiar', JSON.stringify(this.botaoCopiar));
      this.scrollToBottom();
      return;
    }

    this.isLoading = true;
    const mensagemFormatada = this.formatarMensagem(inputText);
    const mensagemItem = new Mensagem(mensagemFormatada);
    this.mensagens.push(mensagemItem);
    this.botaoCopiar.push('Copiar Código');
    localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
    localStorage.setItem('botaoCopiar', JSON.stringify(this.botaoCopiar));

    this.botApiRestService.enviarMensagem(inputText).subscribe(
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
        localStorage.setItem('botaoCopiar', JSON.stringify(this.botaoCopiar));
      },
      (error) => {
        console.error('Erro ao enviar mensagem', error);
        this.isLoading = false;
      }
    );
  }

  mensagemSobreCodigo(mensagem: string): boolean {
    const padroesCodigo = /(\bclass\b|\bfunction\b|\bvar\b|\bconst\b|\blet\b|<[^>]*>|{|}|\(|\))/i;
    return padroesCodigo.test(mensagem);
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

  formatarMensagem(mensagem: string): string {
    return mensagem;
  }

  formatarResposta(resposta: string): string {
    return resposta;
  }

  copiaCodigo(text: string, index: number) {
    navigator.clipboard.writeText(text).then(() => {
      this.botaoCopiar[index] = 'Copiado!';

      setTimeout(() => {
        this.botaoCopiar[index] = 'Copiar Código';
      }, 1200);

    }).catch(err => {
      console.error('Erro ao copiar o texto: ', err);
    });
  }

  contemCodigo(mensagem: string): boolean {
    const padroesCodigo = /(\bclass\b|\bfunction\b|\bvar\b|\bconst\b|\blet\b|<[^>]*>|{|}|\(|\))/i;
    return padroesCodigo.test(mensagem);
  }

}
