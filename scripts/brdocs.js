brdocs = {
  /**
   * Enum com opções do validador
   * @readonly
   * @enum {number}
   */
  cpfcnpj: { CPF: 1, CNPJ: 2, AMBOS: 3 },

  /**
   * Função que valida CPF e CNPJ de uma só vez.
   * O Documento a ser validado depende apenas da quantidade de dígitos
   * 11 é aceito como CPF, 14 como CNPJ..
   * @param {string} value - Número do CPF ou CNPJ a ser validado.
   * @param {Element} element - Elemento HTML onde o valor se encontra.
   * @param {Object} [params=3] params - pametros do validador definidos
   *			pelo enum brdocs.cpfcnpj, default assume AMBOS
   * @returns {boolean} se o documento é válido
   */
  cpfcnpjValidator: function (value, element, params) {
    //params = (typeof params === 'undefined' || (typeof params === 'boolean' && params) ) ? brdocs.cpfcnpj.AMBOS : params;
    value = value.replace(/[^\d]+/g, ""); //Remove todos os cacteres que exceto [0-9]
    var isCNPJ = false;

    if (value.length != 11 && value.length != 14) return false;

    switch (params) {
      case brdocs.cpfcnpj.CPF:
        if (value.length != 11) return false;
        isCNPJ = false;
        break;
      case brdocs.cpfcnpj.CNPJ:
        if (value.length != 14) return false;
        isCNPJ = true;
        break;
      default:
        isCNPJ = value.length === 14;
        break;
    }

    if (/^(\d)\1+$/.test(value)) return false; //falso se se todos os digitos forem iguais, os digitos verificadores estão corretos, mas o documento não é válido.

    if (
      brdocs.calculaDigito(value, value.length - 3, isCNPJ) !=
      parseInt(value.charAt(value.length - 2))
    )
      return false;
    if (
      brdocs.calculaDigito(value, value.length - 2, isCNPJ) !=
      parseInt(value.charAt(value.length - 1))
    )
      return false;

    return true;
  },
  /**
   * Função que valida 1 dígito verificador, lembrando que
   * esta função não vai checar se o documento tem tamanho
   * documento está correto, vai apenas calcular o dígito.
   * A única diferença nos algoritimos de CPF e CNPJ é que o
   * multiplicador deve voltar a 2 quando passar de 9 no caso
   * do cnpj, ao contrário do CPF que multiplicador máximo é
   * quantidade de caracteres no processo de soma + 2.
   *
   * @param {string} doc - Número do documento CPF ou CNPJ a ser validado (somente números).
   * @param {number} start [start=doc.length-1] - Indice do char em doc por onde o iteração do cálculo deve iniciar
   * 	(útil quando a string doc não foi separada previamento dos dígitos verificadores).
   * @param {boolean} [isCNPJ=false] - Se documento deve ser tratado como CPF, se omitido é tratado como falso.
   * @returns {number} valor calculado do digito.
   */
  calculaDigito: function (doc, start, isCNPJ) {
    if (doc.length === 0) return false;

    start = typeof start === "undefined" ? doc.length - 1 : start;

    if (start >= doc.length) return false;

    if (isNaN(doc)) return false;

    isCNPJ = typeof isCNPJ === "undefined" ? false : isCNPJ;

    var add = 0;
    var multi = 2;

    for (i = start; i >= 0; i--) {
      add += parseInt(doc.charAt(i)) * multi++;
      if (isCNPJ && multi > 9) multi = 2;
    }
    var resultado = 11 - (add % 11);

    return resultado < 10 ? resultado : 0;
  },
};
if (Object.freeze) {
  Object.freeze(brdocs);
}
$.validator.addMethod(
  "cpfcnpj",
  brdocs.cpfcnpjValidator,
  "Informe um CPF/CNPJ válido."
);