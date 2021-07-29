import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CrudService } from '../services/crud.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Router } from '@angular/router';
export interface imgFile {
  name: string;
  filepath: string;
  size: number;
}

export class TODO {
  $key: string;
  name: string;
  uid: string;
  message: string;
}

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  email: string;
  uid: string;
  name: string;

  Chats: TODO[];
  todoForm: FormGroup;
  FormToSend: FormGroup;

  //Files
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  // Uploaded image collection
  files: Observable<imgFile[]>;

  // Image specifications
  imgName: string;
  imgSize: number;

  // File uploading status
  isFileUploading: boolean;
  isFileUploaded: boolean;

  //Maps

  @ViewChild('map',  {static: false}) mapElement: ElementRef;
  map: any;
  address: string;
  lat: string;
  long: string;
  autocomplete: { input: string };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;

  private filesCollection: AngularFirestoreCollection<imgFile>;
  constructor(
    private crudService: CrudService,
    private navCtrl: NavController,
    private authService: AuthenticationService,
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router: Router,
    public zone: NgZone,
  ) {
    this.isFileUploading = false;
    this.isFileUploaded = false;

    // Define uploaded files collection
    this.filesCollection = afs.collection<imgFile>('imagesCollection');
    this.files = this.filesCollection.valueChanges();

    //Google Maps
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];
  }

  ngOnInit() {
    this.authService.userDetails().subscribe(
      (user) => {
        if (user !== null) {
          this.email = user.email;
          this.uid = user.uid;
          this.crudService.getUser(this.uid).subscribe((res) => {
            this.name = res['name'];
          });
        } else {
          this.navCtrl.navigateBack('');
        }
      },
      (err) => {
        console.log('err', err);
      }
    );

    this.crudService.getChats().subscribe((res) => {
      this.Chats = res.map((t) => {
        return {
          id: t.payload.doc.id,
          ...(t.payload.doc.data() as TODO),
        };
      });
    });

    this.todoForm = this.formBuilder.group({
      message: [''],
    });

    this.loadMap();
  }

  logout() {
    this.authService
      .logoutUser()
      .then((res) => {
        console.log(res);
        this.navCtrl.navigateBack('');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  todoList() {
    this.crudService.getChats().subscribe((data) => {
      console.log(data);
    });
  }

  onSubmit() {
    if (!this.todoForm.valid) {
      return false;
    } else {
      this.FormToSend = this.formBuilder.group({
        message: this.todoForm.value.message,
        name: this.name,
        email: this.email,
        uid: this.uid,
        create: moment().unix(),
        photo:
          'https://firebasestorage.googleapis.com/v0/b/ionic-cm-99a4b.appspot.com/o/filesStorage%2Fblanco.png?alt=media&token=8bf586d6-5109-44ec-b13e-3cade54031e5',
        location: null,
      });
      this.crudService
        .create(this.FormToSend.value)
        .then(() => {
          this.todoForm.reset();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Image files
  uploadImage(event: FileList) {
    const file = event.item(0);

    // Image validation
    if (file.type.split('/')[0] !== 'image') {
      console.log('File type is not supported!');
      return;
    }

    this.isFileUploading = true;
    this.isFileUploaded = false;

    this.imgName = file.name;

    // Storage path
    const fileStoragePath = `${this.name}-${this.uid}/${new Date().getTime()}_${
      file.name
    }`;

    // Image reference
    const imageRef = this.afStorage.ref(fileStoragePath);
    // File upload task
    this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);

    console.log('img', this.fileUploadTask);
    // Show uploading progress
    this.percentageVal = this.fileUploadTask.percentageChanges();
    this.trackSnapshot = this.fileUploadTask.snapshotChanges().pipe(
      finalize(() => {
        // Retreive uploaded image storage path
        this.UploadedImageURL = imageRef.getDownloadURL();

        this.UploadedImageURL.subscribe(
          (resp) => {
            this.storeFilesFirebase({
              name: file.name,
              filepath: resp,
              size: this.imgSize,
            });
            this.isFileUploading = false;
            this.isFileUploaded = true;
          },
          (error) => {
            console.log(error);
          }
        );
      }),
      tap((snap) => {
        this.imgSize = snap.totalBytes;
      })
    );
  }

  storeFilesFirebase(image: imgFile) {
    const fileId = this.afs.createId();

    this.FormToSend = this.formBuilder.group({
      message: 'Ha enviado una imagen',
      name: this.name,
      email: this.email,
      uid: this.uid,
      create: moment().unix(),
      photo: image.filepath,
      location: null,
    });
    this.crudService
      .create(this.FormToSend.value)
      .then(() => {
        this.todoForm.reset();
      })
      .catch((error) => {
        console.log(error);
      });
    this.filesCollection
      .doc(fileId)
      .set(image)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

//CARGAR EL MAPA TIENE DOS PARTES 
loadMap() {
  
  //OBTENEMOS LAS COORDENADAS DESDE EL TELEFONO.
  this.geolocation.getCurrentPosition().then((resp) => {
    let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    } 
    
    //CUANDO TENEMOS LAS COORDENADAS SIMPLEMENTE NECESITAMOS PASAR AL MAPA DE GOOGLE TODOS LOS PARAMETROS.
    this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude); 
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions); 
    this.map.addListener('tilesloaded', () => {
      console.log('accuracy',this.map, this.map.center.lat());
      this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      this.lat = this.map.center.lat()
      this.long = this.map.center.lng()
    }); 
  }).catch((error) => {
    console.log('Error getting location', error);
  });
}


getAddressFromCoords(lattitude, longitude) {
  console.log("getAddressFromCoords "+lattitude+" "+longitude);
  let options: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5    
  }; 
  this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
    .then((result: NativeGeocoderResult[]) => {
      this.address = "";
      let responseAddress = [];
      for (let [key, value] of Object.entries(result[0])) {
        if(value.length>0)
        responseAddress.push(value); 
      }
      responseAddress.reverse();
      for (let value of responseAddress) {
        this.address += value+", ";
      }
      this.address = this.address.slice(0, -2);
    })
    .catch((error: any) =>{ 
      this.address = "Address Not Available!";
    }); 
}

//FUNCION DEL BOTON INFERIOR PARA QUE NOS DIGA LAS COORDENADAS DEL LUGAR EN EL QUE POSICIONAMOS EL PIN.
ShowCords(){
  alert('lat' +this.lat+', long'+this.long )
}

sendLocation(){
  this.FormToSend = this.formBuilder.group({
    message: 'Ha enviado su ubicación',
    name: this.name,
    email: this.email,
    uid: this.uid,
    create: moment().unix(),
    photo: 'https://firebasestorage.googleapis.com/v0/b/ionic-cm-99a4b.appspot.com/o/filesStorage%2Fblanco.png?alt=media&token=8bf586d6-5109-44ec-b13e-3cade54031e5',
    location: "Lat: " + this.lat + "  - Long: " + this.long ,
  });
  this.crudService
    .create(this.FormToSend.value)
    .then(() => {
      this.todoForm.reset();
    })
    .catch((error) => {
      console.log(error);
    });
}


}
