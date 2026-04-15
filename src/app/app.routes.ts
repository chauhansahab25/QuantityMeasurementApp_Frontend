import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard, unauthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent, canActivate: [unauthGuard] },
      { path: 'register', component: RegisterComponent, canActivate: [unauthGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];
