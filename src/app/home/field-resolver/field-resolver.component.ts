import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-field-resolver',
  templateUrl: './field-resolver.component.html',
  styleUrls: ['./field-resolver.component.scss']
})
export class FieldResolverComponent implements OnInit {

  @Input() options: Array<string> = [];

  constructor(public popoverCtrl: PopoverController) { }

  onSelect(option) {
    this.popoverCtrl.dismiss({ choice: option });
  }

  ngOnInit() { }

}
