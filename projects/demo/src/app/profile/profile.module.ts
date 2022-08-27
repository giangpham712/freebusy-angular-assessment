import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileRoutingModule } from './profile-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, ProfileRoutingModule],
  exports: [],
  declarations: [ProfileComponent],
  providers: [],
})
export class ProfileModule {}
