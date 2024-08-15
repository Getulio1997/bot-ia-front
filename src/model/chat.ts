import { Mensagem } from "./mensagem";

export class Chat {
  nome: string;
  mensagens: Mensagem[];

  constructor(nome: string) {
    this.nome = nome;
    this.mensagens = [];
  }
}
