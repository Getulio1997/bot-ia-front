import { BotApiRestService } from './../../service/bot-api-rest.service';
import { Component } from '@angular/core';
import { Mensagem } from '../../model/mensagem';

@Component({
  selector: 'app-bot-ia',
  templateUrl: './bot-ia.component.html',
  styleUrl: './bot-ia.component.scss'
})
export class BotIaComponent {

  mensagem: Mensagem[] = []

  constructor(
    private botService: BotApiRestService
  ) {}

}
