import { LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { FormsModule } from "@angular/forms";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { BotApiRestService } from "../service/bot-api-rest.service";
import { AnalyticodeComponent } from "./analyticode/analyticode.component";
import { registerLocaleData } from "@angular/common";
import localePt from '@angular/common/locales/pt';


registerLocaleData(localePt);
@NgModule({
  declarations: [
    AppComponent,
    AnalyticodeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    BotApiRestService,
    provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent]
})
export class AppModule {}
