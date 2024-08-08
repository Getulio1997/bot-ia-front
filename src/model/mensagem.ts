export class Mensagem {
  mensagem: string;
  resposta?: string;

  constructor(mensagem: string, resposta?: string) {
    this.mensagem = mensagem;
    this.resposta = resposta;
  }
}
