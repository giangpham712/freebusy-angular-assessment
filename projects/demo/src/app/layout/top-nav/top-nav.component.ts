import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  templateUrl: 'top-nav.component.html',
})
export class TopNavComponent {
  links = [
    { title: 'Home', path: '/' },
    { title: 'Profile', path: '/profile' },
    { title: 'Share', path: '/share' },
  ];

  constructor(public route: ActivatedRoute, public router: Router) {}
}
