import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShareComponent } from './pages/share/share.component';

const routes: Routes = [{ path: '', component: ShareComponent, data: { title: 'Share' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  providers: [],
})
export class ShareRoutingModule {}
