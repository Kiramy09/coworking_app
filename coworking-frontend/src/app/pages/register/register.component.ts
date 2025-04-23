import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(7),
          Validators.maxLength(15),
          Validators.pattern('.*[0-9].*')  // regex pour au moins un chiffre
        ]
      ],
      confirmPassword: ['', Validators.required],
      gender: [''],
      birth_date: [null],
      address: [''],
      activity: [''],
      avatar: [null]
    });
  }

  isSubmitting = false;

  onSubmit() {
    if (this.registerForm.valid && this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value) {
      this.isSubmitting = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.router.navigate(['/complete-profile']);
        },
        error: (err) => {
          this.isSubmitting = false;
          alert("Une erreur est survenue.");
        }
      });
    } else {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        alert("Les mots de passe ne correspondent pas !");
      } else {
        console.error('Form is invalid');
      }
    }
  }
}