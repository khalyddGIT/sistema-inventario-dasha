import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { RegistroComponent } from './components/registro/registro.component';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras.component';
import { ProveedoresComprasComponent } from './components/proveedores-compras/proveedores-compras.component';
import { RoleGuard } from './guards/role.guard';
import { Role } from './models/role';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'forgot-password', component: LoginComponent }, // Using login component for now
  { path: 'dashboard', component: DashboardComponent, canActivate: [RoleGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [RoleGuard] },
  {
    path: 'compra',
    component: ProveedoresComprasComponent,  // Nueva funcionalidad de proveedores y compras
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'historial-compras',
    component: HistorialComprasComponent,
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  },
  {
    path: 'reportes',
    component: ReportesComponent,
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }