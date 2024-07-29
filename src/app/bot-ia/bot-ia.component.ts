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

  mensagem: Mensagem[] = []
  inputText: string = '';

  constructor(
    private botService: BotApiRestService
  ) {}

  onSubmit(): void {
    console.log('Form submitted:', this.inputText);
  }

  ajustaAltura(): void {
    const textarea = this.textarea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 2 * parseFloat(getComputedStyle(textarea).fontSize))}px`;
  }

}
