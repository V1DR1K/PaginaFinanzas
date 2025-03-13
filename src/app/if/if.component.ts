import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-if',
  imports: [],
  templateUrl: './if.component.html',
  styleUrl: './if.component.scss'
})
export class IfComponent {
  protected isVisible = true
}
