import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Credenciales, FactorDeAutenticacionPorCodigo, Login, Usuario} from '../models';
import {LoginRepository ,UsuarioRepository} from '../repositories';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
const generator = require('generate-password');
const MD5 = require("crypto-js/md5");
const jwt = require('jsonwebtoken');


@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    public repositorioUsuario : UsuarioRepository,
    @repository(LoginRepository)
    public repositorioLogin: LoginRepository
    ) {}

  /*
   * Add service methods here
   */
  /**
   * Genera una cadena aleatoria
   * @returns cadena aleatoria de n caracteres
   */
  crearTextoAleatorio(n:number): string {
    let clave = generator.generate({
      length: n,
      numbers: true
    });
    return clave;
  }

  /**
   * Cifra una cadena de caracteres con método md5
   * @param cadena texto a cifrar
   * @returns cadena cifrada con md5
   */
  cifrarTexto(cadena:string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

/**
 * Se busca un usuario por sus credenciales de acceso
 * @param credenciales credenciales del usuario
 * @returns usuario encontrado o null
 */
  async identificarUsuario(credenciales:Credenciales):Promise<Usuario | null> {
    //buscar el usuario por el correo
    let usuario = await this.repositorioUsuario.findOne({
      where:{
        correo:credenciales.correo,
        clave:credenciales.clave
      }
    });
    return usuario as Usuario;
  }

  /**
   * Valida un código de 2fa para un usuario
   * @param credenciales2fa credenciales del usuario con el código del 2fa
   * @returns el registro de login o null
   */
  async validarCodigo2fa (credenciales2fa: FactorDeAutenticacionPorCodigo):Promise<Usuario|null>{
    let login =await this.repositorioLogin.findOne({
      where:{
        usuarioId: credenciales2fa.usuarioId,
        codigo2fa: credenciales2fa.codigo2fa,
        estadoCodigo2fa: false
      }
    });
    if(login){
      let usuario = await this.repositorioUsuario.findById(credenciales2fa.usuarioId);
      return usuario;
    }
    return (login)? login: null;
  }

  /**
   * Generación de jwt
   * @param usuario información del usuario
   * @returns token
   */
  crearToken(usuario: Usuario): string {
    let datos = {
      name: `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`,
      role: usuario.rolId,
      email: usuario.correo
    };
    let token = jwt.sign({datos}, ConfiguracionSeguridad.claveJWT);
    console.log(token + "Hellow");
    return token;
  }
}
