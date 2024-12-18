import { Component, ElementRef, ViewChild, OnInit, HostListener } from '@angular/core';
import { Mensagem } from '../../model/mensagem';
import { BotApiRestService } from './../../service/bot-api-rest.service';

@Component({
  selector: 'app-analyticode',
  templateUrl: './analyticode.component.html',
  styleUrls: ['./analyticode.component.scss']
})
export class AnalyticodeComponent implements OnInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  inputText: string = '';
  mensagens: Mensagem[] = [];
  botaoCopiar: string[] = [];
  botaoCopiarUser: string[] = [];
  botaoCopiarBot: string[] = [];
  iconUserStates: boolean[] = [];
  iconBotStates: boolean[] = [];
  isLoading: boolean = false;
  showScrollButton: boolean = false;
  showOptions: boolean[] = [];
  sucessoMensagem: string = '';

  constructor(private botApiRestService: BotApiRestService) {}

  ngOnInit() {
    this.loadMessages();
  }

  enviaMensagem(inputText: string, event: Event) {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }

    if (!inputText.trim()) {
      return;
    }

    const mensagemItem = new Mensagem(inputText);
    if (!this.mensagemComTermosDeContexto(inputText)) {
      mensagemItem.resposta = 'Não é possível responder essa pergunta, pois não tenho suporte.';
      this.mensagens.push(mensagemItem);
      this.botaoCopiar.push('Copiar');
      this.saveToLocalStorage();
      this.scrollToBottom();
      this.resetTextarea();
      this.inputText = '';
      return;
    }

    if (!this.mensagemSobreCodigo(inputText)) {
      mensagemItem.resposta = 'A mensagem não está relacionada a código.';
      this.mensagens.push(mensagemItem);
      this.botaoCopiar.push('Copiar');
      this.saveToLocalStorage();
      this.scrollToBottom();
      this.resetTextarea();
      this.inputText = '';
      return;
    }

    this.resetTextarea();
    this.inputText = '';
    this.isLoading = true;

    this.mensagens.push(mensagemItem);
    this.botaoCopiar.push('Copiar');
    this.saveToLocalStorage();
    this.scrollToBottom();

    this.botApiRestService.enviarMensagem(inputText).subscribe(
      (response) => {
        mensagemItem.resposta = response.resposta || 'Resposta padrão';
        this.saveToLocalStorage();
        this.scrollToBottom();
        this.isLoading = false;
        this.resetTextarea();
      },
      (error) => {
        mensagemItem.resposta = 'Não é possível responder essa pergunta, pois não tenho suporte.';
        this.saveToLocalStorage();
        this.scrollToBottom();
        this.isLoading = false;
        this.resetTextarea();
      }
    );
  }

  mensagemComTermosDeContexto(mensagem: string): boolean {
    const termosContexto = /\b(código|programação|script|debug|variável|compilação|sintaxe|função|classe|objeto|método|loop|condicional|algoritmo|array|estrutura de dados|compilador|ide|framework|linguagem|biblioteca|sistema|API|algoritmo|JSON|parse|object|array|string|trecho de código|texto de código)\b/i;
    return termosContexto.test(mensagem);
  }

  mensagemSobreCodigo(mensagem: string): boolean {
    const padroesCodigo = /\b(class|function|if|else|for|while|const|let|var|return|try|catch|throw|=>|[\{\[\}\]\(\);=+*\/\-])/i;
    const termosContexto = /\b(código|programação|script|debug|variável|compilação|sintaxe|função|classe|objeto|método|loop|condicional|algoritmo|array|estrutura de dados|compilador|ide|framework|linguagem|biblioteca|sistema|API|algoritmo|JSON|parse|object|array|string|trecho de código|texto de código)\b/i;
    const palavrasIgnoradas = /\b(Rússia|Brasil|EUA|China|India|França|Alemanha|Japão)\b/i;

    if (palavrasIgnoradas.test(mensagem)) {
      return false;
    }
    return padroesCodigo.test(mensagem) || termosContexto.test(mensagem);
  }

  resetTextarea() {
    const textarea = this.textarea.nativeElement;
    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
      this.onScroll();
    }, 0);
  }

  onScroll() {
    const container = this.chatContainer.nativeElement;
    this.showScrollButton = container.scrollTop < container.scrollHeight - container.clientHeight - 100;
  }

  private saveToLocalStorage() {
    localStorage.setItem('mensagens', JSON.stringify(this.mensagens));
  }

  private loadMessages() {
    const mensagensStorage = localStorage.getItem('mensagens');
    this.mensagens = mensagensStorage ? JSON.parse(mensagensStorage) : [];
  }

  copiarTexto(texto: string | undefined, index: number, tipo: string, origem: string) {
    if (texto) {
      navigator.clipboard.writeText(texto).then(() => {
        console.log(`${tipo} copiada com sucesso!`);

        if (origem === 'user') {
          this.iconUserStates[index] = true;
          this.botaoCopiarUser[index] = 'Copiado';
          setTimeout(() => {
            this.iconUserStates[index] = false;
            this.botaoCopiarUser[index] = 'Copiar';
          }, 2000);
        } else if (origem === 'bot') {
          this.iconBotStates[index] = true;
          this.botaoCopiarBot[index] = 'Copiado';
          setTimeout(() => {
            this.iconBotStates[index] = false;
            this.botaoCopiarBot[index] = 'Copiar';
          }, 2000);
        }
      }).catch(err => {
        console.error('Erro ao copiar o texto:', err);
      });
    }
  }

  toggleOptions(index: number) {
    this.showOptions[index] = !this.showOptions[index];
  }

  editarMensagem(index: number) {
    const mensagem = this.mensagens[index];
    this.inputText = mensagem.mensagem;
    this.mensagens.splice(index, 1);
    this.saveToLocalStorage();
    this.textarea.nativeElement.focus();
  }

  excluirMensagem(index: number) {
    this.mensagens.splice(index, 1);
    this.saveToLocalStorage();
    this.onScroll();
    this.scrollToBottom();

    this.showScrollButton = this.chatContainer.nativeElement.scrollTop < this.chatContainer.nativeElement.scrollHeight - this.chatContainer.nativeElement.clientHeight - 100;

    this.sucessoMensagem = 'Mensagem excluída com sucesso!';

    setTimeout(() => {
      this.sucessoMensagem = '';
    }, 3000);
}


  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.menu-btn') && !target.closest('.menu-options')) {
      this.closeAllOptions();
    }
  }

  closeAllOptions() {
    this.showOptions.fill(false);
  }
}
