import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HistoryComponent } from './features/history/history.component';

const routes: Routes = [
  { path: '',                redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',           component: LoginComponent },
  { path: 'register',        component: RegisterComponent },
  { path: 'auth/callback',   component: GoogleCallbackComponent },
  { path: 'dashboard',       component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'history',         component: HistoryComponent,   canActivate: [AuthGuard] },
  { path: '**',              redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
