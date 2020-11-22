import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { RegisterForm } from '../interfaces/register-form.interface';
import { environment } from '../../environments/environment';
import { LoginForm } from '../interfaces/login-form.interface';
import { tap, map, catchError } from 'rxjs/operators';
import { pipe, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

const base_url = environment.base_url;
declare const gapi:any;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public auth2:any;

  constructor(private http: HttpClient, private router: Router, private ngZone:NgZone) {
    this.googleInit();
  }

  googleInit() {
    return new Promise(resolve=> {
      gapi.load('auth2', () => {
        this.auth2 = gapi.auth2.init({
          client_id: '1053162143765-4niqikhfpes61qljd1958slilb1r9fp3.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin',
        });
        resolve();
      });
      
    });
  }

  logout() {
    localStorage.removeItem('token');
    
    this.auth2.signOut().then( () => {
      this.ngZone.run(() => {
        this.router.navigateByUrl('/login');
      });
    });
  }

  validarToken():Observable<boolean> {
    const token = localStorage.getItem('token') || '';

    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }
    }).pipe(
      tap( (resp:any) => {
        localStorage.setItem('token', resp.token);  
      }),
      map( resp => true),
      catchError(err => of(false))
    );
  }

  crearUsuario(formData:RegisterForm) {

    return this.http.post(`${base_url}/usuarios`, formData)
    .pipe(
      tap((resp:any) => {
        localStorage.setItem('token', resp.token);        
      })
    )
     
  }

  login(formData:LoginForm) {

    return this.http.post(`${base_url}/login`, formData)
    .pipe(
      tap((resp:any) => {
        localStorage.setItem('token', resp.token);        
      })
    )
     
  }

  loginGoogle(token) {

    return this.http.post(`${base_url}/login/google`, {token})
    .pipe(
      tap((resp:any) => {
        localStorage.setItem('token', resp.token);        
      })
    )
     
  }
}
