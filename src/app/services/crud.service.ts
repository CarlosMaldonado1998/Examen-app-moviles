import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

export class TODO {
  $key: string;
  name: string;
  uid: string;
  message: string;
  email: string;
  location: string;
}

export class USER {
  $key: string;
  email: string;
  uid: string;
  name: string;
}
@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private ngFirestore: AngularFirestore, private router: Router) {}

  create(todo: TODO) {
    return this.ngFirestore.collection('chats').add(todo);
  }

  createUser(values, id) {
    return this.ngFirestore.collection('users').doc(id).set(values);
  }
  getUser(id) {
    return this.ngFirestore.collection('users').doc(id).valueChanges();
  }
  getChats() {
    return this.ngFirestore
      .collection('chats', (ref) => ref.orderBy('create', 'asc'))
      .snapshotChanges();
  }
}
