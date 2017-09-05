import 'rxjs/add/operator/delay'
import { Component } from '@angular/core'
import { LoadingController, NavController, NavParams } from 'ionic-angular'
import { QuestionsPage } from '../questions/questions'
import { AnswerService } from '../../providers/answer-service'
import { TimeStampService} from '../../providers/timestamp-service'
import { Question } from '../../models/question'
import { Assessment } from '../../models/assessment'
import { Task } from '../../models/task'

@Component({
  selector: 'page-start',
  templateUrl: 'start.html'
})
export class StartPage {

  associatedTask: Task
  introduction: String = ""
  title: String = ""
  questions: Question[]
  endText: String

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private answerService: AnswerService,
    private timeStampService: TimeStampService
  ) {
    this.associatedTask = this.navParams.data.associatedTask
    this.title = this.navParams.data.title
    this.introduction = this.navParams.data.introduction
    this.questions = this.navParams.data.questions
    this.endText = this.navParams.data.endText
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.answerService.reset()
    this.timeStampService.reset()
  }

  handleClosePage() {
    this.navCtrl.pop()
  }

  openPage() {
    this.navCtrl.push(QuestionsPage, {
      'associatedTask': this.associatedTask,
      'questions': this.questions,
      'endText': this.endText
    })
  }
}
