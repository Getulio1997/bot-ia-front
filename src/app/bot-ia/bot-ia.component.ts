import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
  showScrollButton: boolean = false;

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    this.loadSettings();
    this.loadMessages();
    this.initializeGlowingBorder();
  }

  private addMessage(inputText: string, resposta: string) {
    this.mensagens.push(new Mensagem(inputText, resposta));
    this.botaoCopiar.push('Copiar Código');
    this.inputText = '';
    this.scrollToBottom();
    this.resetTextarea();
    this.saveToLocalStorage();
  }

  private resetEstado() {
    this.inputText = '';
    this.isLoading = false;
    this.scrollToBottom();
    this.resetTextarea();
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
    localStorage.setItem('botaoCopiar', JSON.stringify(this.botaoCopiar));
  }

  private loadSettings() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeSetting === 'true';
    this.aplicaTema();
  }

  private loadMessages() {
    const mensagensStorage = localStorage.getItem('mensagens');
    this.mensagens = mensagensStorage ? JSON.parse(mensagensStorage).map((msg: any) => new Mensagem(msg.mensagem, msg.resposta)) : [];
    this.botaoCopiar = Array(this.mensagens.length).fill('Copiar Código');
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 0);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove() {
    this.verificaScroll();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
    this.initializeGlowingBorder();
    this.chatContainer.nativeElement.addEventListener('scroll', this.verificaScroll.bind(this));
    setTimeout(() => {
      this.verificaScroll();
      this.resetTextarea();
    }, 1000);
  }

  verificaScroll() {
    const container = this.chatContainer.nativeElement;
    this.showScrollButton = container.scrollHeight - container.scrollTop > container.clientHeight + 100;
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
      this.addMessage(inputText, 'Eu só comento e sugiro melhorias em código. Por favor, envie seu código.');
      this.resetTextarea();
      return;
    }

    const mensagemFormatada = this.formatarMensagem(inputText);
    const mensagemItem = new Mensagem(mensagemFormatada);
    this.mensagens.push(mensagemItem);
    this.botaoCopiar.push('Copiar Código');
    this.saveToLocalStorage();

    this.inputText = '';
    this.resetTextarea();

    this.isLoading = true;

    this.botApiRestService.enviarMensagem(inputText).subscribe(
      (response) => {
        if (this.mensagemSobreCodigo(response.resposta)) {
          mensagemItem.resposta = this.formatarResposta(response.resposta);
        } else {
          mensagemItem.resposta = 'A pergunta não está relacionada ao código.';
        }
        this.resetEstado();
      },
      (error) => {
        if (error.status === 400) {
          this.mensagens = this.mensagens.filter(msg => msg.mensagem !== mensagemItem.mensagem);
          this.botaoCopiar.pop();
          this.addMessage(inputText, 'Eu só comento e sugiro melhorias em código. Por favor, envie seu código.');
        } else {
          this.addMessage(inputText, 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
        }
        this.resetEstado();
      }
    );
  }


  mensagemSobreCodigo(mensagem: string): boolean {
    const padroesCodigo = /(\bclass\b|\bfunction\b|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bconst\b|\blet\b|\bvar\b|<\/?[^>]+>|\{|\}|\(|\)|\[|\])/i;
    const termosContexto = /\b(código|programação|script|erro|debug)\b/i;
    return padroesCodigo.test(mensagem) || termosContexto.test(mensagem);
  }

  removeMensagem(index: number) {
    this.mensagens.splice(index, 1);
    this.saveToLocalStorage();
    setTimeout(() => {
      this.verificaScroll();
    }, 0);
  }

  resetTextarea() {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    setTimeout(() => {
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, 0);
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

  private initializeGlowingBorder() {
    if (!this.textarea) return;

    const textarea = this.textarea.nativeElement;

    textarea.addEventListener('input', () => {
      if (textarea.value !== '') {
        textarea.classList.add('glowing');
      } else {
        textarea.classList.remove('glowing');
      }
    });

    textarea.addEventListener('blur', () => {
      textarea.classList.remove('glowing');
    });

    textarea.addEventListener('focus', () => {
      if (textarea.value !== '') {
        textarea.classList.add('glowing');
      }
    });
  }
}
