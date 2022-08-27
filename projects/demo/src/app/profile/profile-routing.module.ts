import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfileComponent } from './pages/profile/profile.component';

const routes: Routes = [{ path: '', component: ProfileComponent, data: { title: 'Profile' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [],
  providers: [],
})
export class ProfileRoutingModule {}
