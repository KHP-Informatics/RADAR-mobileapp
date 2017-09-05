import { Component, ViewChild, ElementRef } from '@angular/core'
import { NavController, AlertController, Content } from 'ionic-angular'
import { SchedulingService } from '../../providers/scheduling-service'
import { HomeController } from '../../providers/home-controller'
import { Task, TasksProgress } from '../../models/task'
import { EnrolmentPage } from '../enrolment/enrolment'
import { StartPage } from '../start/start'
import { QuestionsPage } from '../questions/questions'
import { SettingsPage } from '../settings/settings'
import { DefaultTask } from '../../assets/data/defaultConfig'


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('content')
  elContent: Content
  elContentHeight: number
  @ViewChild('progressBar')
  elProgress: ElementRef;
  elProgressHeight: number
  @ViewChild('tickerBar')
  elTicker: ElementRef;
  elTickerHeight: number
  @ViewChild('taskInfo')
  elInfo: ElementRef;
  elInfoHeight: number
  @ViewChild('footer')
  elFooter: ElementRef;
  elFooterHeight: number
  @ViewChild('taskCalendar')
  elCalendar: ElementRef

  isOpenPageClicked: boolean = false
  nextTask: Task = DefaultTask
  showCalendar: boolean = false
  showCompleted: boolean = false
  tasksProgress: TasksProgress
  calendarScrollHeight: number = 0

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private schedule: SchedulingService,
    private controller: HomeController,
  ) {
    this.controller.evalEnrolement().then((evalEnrolement) => {
      if (evalEnrolement) {
        this.navCtrl.push(EnrolmentPage)
      }
    })
  }

  ngAfterViewInit() {
  }

  ionViewDidLoad() {
    this.checkForNextTask()
    setInterval(() => {
      this.checkForNextTask()
    }, 10000)
  }

  checkForNextTask() {
    if (!this.showCalendar) {
      this.controller.getNextTask().then((task) => {
        if (task) {
          this.nextTask = task
          this.displayCompleted(false)
        } else {
          this.nextTask = DefaultTask
          this.displayCompleted(true)
        }
      })
    }
  }

  displayCalendar(requestDisplay: boolean) {
    this.showCalendar = requestDisplay
    this.getElementsAttributes()
    this.applyCalendarTransformations()
  }

  displayCompleted(requestDisplay: boolean) {
    this.showCompleted = requestDisplay
    this.getElementsAttributes()
    this.applyCompletedTransformations()
  }

  getElementsAttributes() {
    this.elContentHeight = this.elContent.contentHeight
    this.elProgressHeight = this.elProgress.nativeElement.offsetHeight
    this.elTickerHeight = this.elTicker.nativeElement.offsetHeight
    this.elInfoHeight = this.elInfo.nativeElement.offsetHeight
    this.elFooterHeight = this.elFooter.nativeElement.offsetHeight
  }

  applyCalendarTransformations() {
    if (this.showCalendar) {
      this.elProgress.nativeElement.style.transform =
        `translateY(-${this.elProgressHeight}px) scale(0.5)`
      this.elTicker.nativeElement.style.transform =
        `translateY(-${this.elProgressHeight}px)`
      this.elInfo.nativeElement.style.transform =
        `translateY(-${this.elProgressHeight}px)`
      this.elFooter.nativeElement.style.transform =
        `translateY(${this.elFooterHeight}px) scale(0)`
      this.elCalendar.nativeElement.style.transform =
        `translateY(-${this.elProgressHeight}px)`
      this.elCalendar.nativeElement.style.opacity = 1
    } else {
      this.elProgress.nativeElement.style.transform =
        'translateY(0px) scale(1)'
      this.elTicker.nativeElement.style.transform =
        'translateY(0px)'
      this.elInfo.nativeElement.style.transform =
        'translateY(0px)'
      this.elFooter.nativeElement.style.transform =
        'translateY(0px) scale(1)'
      this.elCalendar.nativeElement.style.transform =
        'translateY(0px)'
      this.elCalendar.nativeElement.style.opacity = 0
    }
    this.setCalendarScrollHeight(this.showCalendar)
  }

  setCalendarScrollHeight(show: boolean) {
    if (show) {
      this.calendarScrollHeight = this.elContentHeight
        - this.elTickerHeight
        - this.elInfoHeight
        - 80
    } else {
      this.calendarScrollHeight = 0
    }

  }

  applyCompletedTransformations() {
    if (this.showCompleted) {
      this.elTicker.nativeElement.style.padding =
        `0`
      this.elTicker.nativeElement.style.transform =
        `translateY(${this.elInfoHeight + this.elFooterHeight}px)`
      this.elInfo.nativeElement.style.transform =
        `translateY(${this.elInfoHeight + this.elFooterHeight}px) scale(0)`
      this.elFooter.nativeElement.style.transform =
        `translateY(${this.elInfoHeight + this.elFooterHeight}px) scale(0)`
    } else {
      this.elTicker.nativeElement.style.padding =
        '0 0 2px 0'
      this.elTicker.nativeElement.style.transform =
        'translateY(0px)'
      this.elInfo.nativeElement.style.transform =
        'translateY(0px) scale(1)'
      this.elFooter.nativeElement.style.transform =
        'translateY(0px) scale(1)'
    }
  }

  openSettingsPage() {
    this.navCtrl.push(SettingsPage)
  }

  startQuestionnaire() {
    this.controller.getAssessment(this.nextTask).then((assessment) => {
      console.log(assessment)
      let params = {
        "title": assessment.name,
        "introduction": assessment.startText,
        "endText": assessment.endText,
        "questions": assessment.questions,
        "associatedTask": this.nextTask
      }
      if (assessment.showIntroduction) {
        this.navCtrl.push(StartPage, params)
      } else {
        this.navCtrl.push(QuestionsPage, params)
      }
      this.controller.updateAssessmentIntroduction(assessment)
    })
  }

  showCredits() {
    let buttons = [
      {
        text: 'Okay',
        handler: () => {
          console.log('Okay clicked');
        }
      }
    ]
    this.showAlert({
      'title': 'Credits',
      'message': 'Made with &hearts; for you by the RADAR-CNS consortium. For more information click <a href="http://radar-cns.org">here</a>.',
      'buttons': buttons
    })
  }

  showAlert(parameters) {
    let alert = this.alertCtrl.create({
      title: parameters.title,
      buttons: parameters.buttons
    })
    if (parameters.message) {
      alert.setMessage(parameters.message)
    }
    if (parameters.inputs) {
      for (var i = 0; i < parameters.inputs.length; i++) {
        alert.addInput(parameters.inputs[i])
      }
    }
    alert.present()
  }

}
