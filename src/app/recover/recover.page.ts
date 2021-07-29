import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-recover',
  templateUrl: './recover.page.html',
  styleUrls: ['./recover.page.scss'],
})
export class RecoverPage implements OnInit {

  validations_form: FormGroup;
  errorMessage: string = '';

  constructor(
    private navCtrl: NavController,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ])
      ),
    });
  }

  validation_messages = {
    email: [
      { type: 'required', message: 'Ingrese su correo electrónico' },
      { type: 'pattern', message: 'Ingrese un correo electrónico válido' },
    ],
  };

  RecoverPassword(value) {
    this.authService.recoverPasswordUser(value).then(
      (res) => {
        console.log(res);
        this.errorMessage = '';
        this.navCtrl.navigateForward('/login');
      },
      (err) => {
        this.errorMessage = err.message;
      }
    );
  }

  goToLoginPage() {
    this.navCtrl.navigateForward('/login');
  }

}
