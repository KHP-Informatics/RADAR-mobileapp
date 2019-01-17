import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core'
import {
  AlertController,
  Content,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular'

import { DefaultTask } from '../../../../assets/data/defaultConfig'
import { KafkaService } from '../../../core/services/kafka.service'
import { StorageService } from '../../../core/services/storage.service'
import { LocKeys } from '../../../shared/enums/localisations'
import { StorageKeys } from '../../../shared/enums/storage'
import { Task, TasksProgress } from '../../../shared/models/task'
import { TranslatePipe } from '../../../shared/pipes/translate/translate'
import { checkTaskIsNow } from '../../../shared/utilities/check-task-is-now'
import { ClinicalTasksPageComponent } from '../../clinical-tasks/containers/clinical-tasks-page.component'
import { QuestionsPageComponent } from '../../questions/containers/questions-page.component'
import { SettingsPageComponent } from '../../settings/containers/settings-page.component'
import { StartPageComponent } from '../../start/containers/start-page.component'
import { TasksService } from '../services/tasks.service'

@Component({
  selector: 'page-home',
  templateUrl: 'home-page.component.html',
  animations: [
    trigger('displayCalendar', [
      state('true', style({ transform: 'translateY(0%)' })),
      state('false', style({ transform: 'translateY(100%)' })),
      transition('*=>*', animate('300ms ease-out'))
    ])
  ]
})
export class HomePageComponent {
  tasks: Promise<Task[]>
  nextTask: Task
  showCalendar = false
  showCompleted = false
  showNoTasksToday = false
  tasksProgress: TasksProgress = { numberOfTasks: 1, completedTasks: 0 }
  startingQuestionnaire = false
  hasClinicalTasks = false
  taskIsNow = false
  checkTaskInterval

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private tasksService: TasksService,
    private translate: TranslatePipe,
    public storage: StorageService,
    private platform: Platform,
    private kafka: KafkaService
  ) {
    this.platform.resume.subscribe(e => {
      this.kafka.sendAllAnswersInCache()
      this.checkForNextTask()
    })
  }

  ionViewWillEnter() {
    this.startingQuestionnaire = false
  }

  ionViewDidLoad() {
    this.tasks = this.tasksService.getTasksOfToday()
    this.tasks.then(tasks => {
      this.checkTaskInterval = setInterval(() => {
        this.checkForNextTask()
      }, 1000)
      this.tasksProgress = this.tasksService.getTaskProgress(tasks)
      this.showNoTasksToday = this.tasksProgress.numberOfTasks == 0
    })
    this.evalHasClinicalTasks()
    this.tasksService.sendNonReportedTaskCompletion()
  }

  checkForNextTask() {
    this.tasks.then(tasks =>
      this.checkForNextTaskGeneric(this.tasksService.getNextTask(tasks))
    )
  }

  checkForNextTaskGeneric(task) {
    if (task && task.isClinical == false) {
      this.nextTask = task
      this.taskIsNow = checkTaskIsNow(this.nextTask.timestamp)
      this.showCompleted = !this.nextTask
    } else {
      this.taskIsNow = false
      this.nextTask = null
      this.tasks.then(tasks => {
        this.showCompleted = this.tasksService.areAllTasksComplete(tasks)
        if (this.showCompleted) {
          clearInterval(this.checkTaskInterval)
          this.showCalendar = false
        }
      })
    }
  }

  evalHasClinicalTasks() {
    this.storage.get(StorageKeys.HAS_CLINICAL_TASKS).then(isClinical => {
      this.hasClinicalTasks = isClinical
    })
  }

  displayTaskCalendar() {
    this.showCalendar = !this.showCalendar
  }

  openSettingsPage() {
    this.navCtrl.push(SettingsPageComponent)
  }

  openClinicalTasksPage() {
    this.navCtrl.push(ClinicalTasksPageComponent)
  }

  startQuestionnaire(taskCalendarTask: Task) {
    // NOTE: User can start questionnaire from task calendar or start button in home.
    let startQuestionnaireTask = this.nextTask
    if (taskCalendarTask) {
      if (taskCalendarTask.completed === false) {
        startQuestionnaireTask = taskCalendarTask
      }
    } else {
      this.startingQuestionnaire = true
    }
    const lang = this.storage.get(StorageKeys.LANGUAGE)
    const nextAssessment = this.tasksService.getAssessment(
      startQuestionnaireTask
    )
    Promise.all([lang, nextAssessment]).then(res => {
      const language = res[0].value
      const assessment = res[1]
      const params = {
        title: assessment.name,
        introduction: assessment.startText[language],
        endText: assessment.endText[language],
        questions: assessment.questions,
        associatedTask: startQuestionnaireTask,
        assessment: assessment,
        isLastTask: false
      }

      this.tasksService
        .isLastTask(startQuestionnaireTask, this.tasks)
        .then(lastTask => (params.isLastTask = lastTask))
        .then(() => {
          if (assessment.showIntroduction) {
            this.navCtrl.push(StartPageComponent, params)
          } else {
            this.navCtrl.push(QuestionsPageComponent, params)
          }
        })
    })
  }

  showCredits() {
    const buttons = [
      {
        text: this.translate.transform(LocKeys.BTN_OKAY.toString()),
        handler: () => {}
      }
    ]
    this.showAlert({
      title: this.translate.transform(LocKeys.CREDITS_TITLE.toString()),
      message: this.translate.transform(LocKeys.CREDITS_BODY.toString()),
      buttons: buttons
    })
  }

  showAlert(parameters) {
    const alert = this.alertCtrl.create({
      title: parameters.title,
      buttons: parameters.buttons
    })
    if (parameters.message) {
      alert.setMessage(parameters.message)
    }
    if (parameters.inputs) {
      for (let i = 0; i < parameters.inputs.length; i++) {
        alert.addInput(parameters.inputs[i])
      }
    }
    alert.present()
  }
}
