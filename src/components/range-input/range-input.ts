import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

let uniqueID = 0

export interface Item {
  id: string
  value: any
}

@Component({
  selector: 'range-input',
  templateUrl: 'range-input.html'
})
export class RangeInputComponent implements OnInit {

  @Output() valueChange: EventEmitter<number> = new EventEmitter<number>()

  @Input() min = 1
  @Input() max = 10

  value: number = null
  uniqueID: number = uniqueID++
  name = `range-input-${this.uniqueID}`
  items: Item[] = Array()

  ngOnInit () {
    for (let i = this.min; i <= this.max; i++) {
      this.items.push({
        id: `range-${this.uniqueID}-${i}`,
        value: i
      })
    }
  }

  onInputChange (event) {
    this.valueChange.emit(+event.target.value)
  }
}
