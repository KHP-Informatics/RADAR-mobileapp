import { Component, Input } from '@angular/core'

import { RangeInputComponent } from '../range-input/range-input.component'
import { Response } from '../../../../../shared/models/question'

@Component({
  selector: 'range-info-input',
  templateUrl: 'range-info-input.component.html'
})
export class RangeInfoInputComponent extends RangeInputComponent {
  @Input()
  responses: Response[]

  itemDescription: string

  onInputChange(value) {
    super.onInputChange(value)
    this.showDescription(value)
  }

  showDescription(id) {
    this.itemDescription = this.responses[id].label
  }
}
