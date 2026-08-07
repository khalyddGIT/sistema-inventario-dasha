import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Modules – ¡TODOS LOS QUE REALMENTE USAS!
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';     // ← ¡ESTE FALTABA!
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';           // ← necesario para el selector de fechas
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';           // ← también lo tenías fuera
import { MessageModule } from 'primeng/message';             // ← este también estaba fuera
import { TabViewModule } from 'primeng/tabview';             // ← necesario para las pestañas
import { ProgressSpinnerModule } from 'primeng/progressspinner'; // ← necesario para el spinner de carga

// Pipes
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Componentes
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductosComponent } from './components/productos/productos.component';
import { ProductoFormComponent } from './components/producto-form/productoform.component';
import { HistorialComprasComponent } from './components/historial-compras/historial-compras.component';
import { ProveedoresComprasComponent } from './components/proveedores-compras/proveedores-compras.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ReportesComponent } from './components/reportes/reportes.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProductosComponent,
    ProductoFormComponent,
    HistorialComprasComponent,
    ProveedoresComprasComponent,
    RegistroComponent,
    ReportesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AppRoutingModule,

    // === PRIMENG – AHORA SÍ ESTÁN TODOS ===
    ButtonModule,
    CardModule,
    TableModule,
    InputTextModule,
    InputNumberModule,      // ← Soluciona todos los errores de [min], [step] en p-inputNumber
    DropdownModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    PasswordModule,         // ← Soluciona feedback, toggleMask, minLength en p-password
    MessageModule,          // ← Soluciona <p-message> is not a known element + [text]
    TabViewModule,          // ← Soluciona <p-tabView> y <p-tabPanel> is not a known element
    CalendarModule,         // ← Soluciona <p-calendar> is not a known element
    ProgressSpinnerModule,  // ← Soluciona <p-progressSpinner> is not a known element
    ChartModule             // ← Para gráficos en reportes
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }