import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */
  /**
   * Genera una clave aleatoria
   * @returns clave aleatoria de 10 caracteres
   */
  crearClave(): string {
    let clave = generator.generate({
      length: 10,
      numbers: true
    });
    return clave;
  }
  /**
   * Cifra una cadena de caracteres
   * @param cadena
   * @returns cadena cifrada
   */
  cifrarTexto(cadena:string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }
}
