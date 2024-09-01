import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('toggleAnimation', [
      state('hidden', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
        padding: '0px'
      })),
      state('visible', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden',
        padding: '*'
      })),
      transition('hidden <=> visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class HomeComponent {
  showDocumentation = false;
  showExplanation = false;

  toggleDocumentation() {
    this.showDocumentation = !this.showDocumentation;
  }

  toggleExplanation() {
    this.showExplanation = !this.showExplanation;
  }
}
