import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticodeComponent } from './analyticode/analyticode.component';

export const routes: Routes = [
  { path: '', redirectTo: '/analytiCode', pathMatch: 'full' },
  { path: 'analytiCode', component: AnalyticodeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
