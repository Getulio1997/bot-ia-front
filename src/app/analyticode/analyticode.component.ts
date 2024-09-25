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

    this.resetTextarea();
    this.inputText = '';
    this.isLoading = true;

    const mensagemItem = new Mensagem(inputText);
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
      },
      (error) => {
        mensagemItem.resposta = 'Não é possível responder essa pergunta, pois não tenho suporte.';
        this.saveToLocalStorage();
        this.scrollToBottom();
        this.isLoading = false;
      }
    );
  }

  resetTextarea() {
    const textarea = this.textarea.nativeElement;
    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
    console.log('inputText:', this.inputText);
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

  copiarResposta(resposta: string | undefined, index: number) {
    if (resposta) {
      navigator.clipboard.writeText(resposta).then(() => {
        console.log('Texto copiado com sucesso!');
        this.botaoCopiar[index] = 'Copiado';
        setTimeout(() => {
          this.botaoCopiar[index] = 'Copiar';
        }, 2000);
      }).catch(err => {
        console.error('Erro ao copiar o texto: ', err);
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
