import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BotIaComponent } from './bot-ia/bot-ia.component';

export const routes: Routes = [
  { path: '', redirectTo: '/codeAnalyzer', pathMatch: 'full' },
  { path: 'codeAnalyzer', component: BotIaComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
