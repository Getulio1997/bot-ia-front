export class Mensagem {
  public mensagem: string;
  public resposta: string | undefined;
  public dataHora: Date;

  constructor(mensagem: string) {
    this.mensagem = mensagem;
    this.resposta = undefined;
    this.dataHora = new Date();
  }
}
