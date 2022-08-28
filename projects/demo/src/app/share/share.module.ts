import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ShareComponent } from './pages/share/share.component';
import { ShareRoutingModule } from './share-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, ShareRoutingModule],
  exports: [CommonModule],
  declarations: [ShareComponent],
  providers: [],
})
export class ShareModule {}
