import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core'
import { Dialogs } from '@ionic-native/dialogs'
import { Vibration } from '@ionic-native/vibration'

import { Answer } from '../../../../shared/models/answer'
import { Question, QuestionType } from '../../../../shared/models/question'

@Component({
  selector: 'question',
  templateUrl: 'question.component.html'
})
export class QuestionComponent implements OnChanges {
  @Input()
  question: Question
  @Input()
  questionIndex: number
  @Input()
  currentIndex: number
  @Output()
  answer: EventEmitter<Answer> = new EventEmitter<Answer>()

  value: any
  currentlyShown = false

  constructor(private vibration: Vibration, private dialogs: Dialogs) {}

  ngOnChanges() {
    if (this.question.select_choices_or_calculations.length > 0) {
      const min = this.question.select_choices_or_calculations[0].code
      const minLabel = this.question.select_choices_or_calculations[0].label
      const max = this.question.select_choices_or_calculations[
        this.question.select_choices_or_calculations.length - 1
      ].code
      const maxLabel = this.question.select_choices_or_calculations[
        this.question.select_choices_or_calculations.length - 1
      ].label
      this.question.range = {
        min: parseInt(min.trim()),
        max: parseInt(max.trim()),
        labelLeft: minLabel.trim(),
        labelRight: maxLabel.trim()
      }
    }
    if (this.questionIndex === this.currentIndex) {
      this.currentlyShown = true
      if (this.value) this.emitAnswer()
    } else {
      this.currentlyShown = false
    }
    // this.evalBeep()
  }

  emitAnswer() {
    this.answer.emit({
      id: this.question.field_name,
      value: this.value,
      type: this.question.field_type
    })
  }

  onValueChange(event) {
    // NOTE: On init the component fires the event once
    if (event === undefined) {
      return
    }

    switch (this.question.field_type) {
      case QuestionType.radio:
      case QuestionType.range:
      case QuestionType.checkbox:
      case QuestionType.slider:
        this.value = event
        break

      case QuestionType.audio:
        // TODO: Add audio file reference to send
        break

      case QuestionType.timed:
      case QuestionType.info:
        this.value = event
        break
    }
    this.emitAnswer()
  }

  evalBeep() {
    if (this.currentlyShown && this.question.field_label.includes('beep')) {
      console.log('Beep!')
      this.dialogs.beep(1)
      this.vibration.vibrate(600)
    }
  }
}
