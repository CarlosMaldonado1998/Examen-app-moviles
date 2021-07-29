import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private afAuth: AngularFireAuth, private aptService: CrudService) {}

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth
        .createUserWithEmailAndPassword(value.email, value.password)
        .then(
          (res) => {resolve(res),
          this.aptService.createUser({
            email: value.email,
            name: value.name,
            uid: res.user.uid
          }, res.user.uid)}
        );
    });
  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(value.email, value.password).then(
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  logoutUser() {
    return new Promise<any>((resolve, reject) => {
      if (this.afAuth.currentUser) {
        this.afAuth
          .signOut()
          .then(() => {
            console.log('Log out');
            (res) => resolve(res);
            
          })
          .catch((error) => {
            reject();
          });
      }
    });
  }

  recoverPasswordUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.sendPasswordResetEmail(value.email).then(
        (res) => resolve(res),
        (err) => reject(err)
      );
    });
  }

  userDetails() {
    return this.afAuth.user;
  }
}
