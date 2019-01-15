import { Component, Input, OnChanges } from '@angular/core'
import { NavController } from 'ionic-angular'

import { SchedulingService } from '../../../../core/services/scheduling.service'
import { LocKeys } from '../../../../shared/enums/localisations'
import { ReportScheduling } from '../../../../shared/models/report'
import { Task } from '../../../../shared/models/task'
import { TickerItem } from '../../../../shared/models/ticker'
import { TranslatePipe } from '../../../../shared/pipes/translate/translate'
import { ReportPageComponent } from '../../../report/containers/report-page.component'

@Component({
  selector: 'ticker-bar',
  templateUrl: 'ticker-bar.component.html'
})
export class TickerBarComponent implements OnChanges {
  @Input()
  task: Task
  @Input()
  items: TickerItem[] = []
  @Input()
  showAffirmation: boolean = false
  tickerItems: TickerItem[]
  tickerIndex: number = 0
  report: ReportScheduling

  hasTask: boolean = true
  tickerWeeklyReport: string
  newWeeklyReport: boolean = false

  constructor(
    private schedule: SchedulingService,
    private navCtrl: NavController,
    private translate: TranslatePipe
  ) {
    // NOTE: Gets ReportScheduling and adds to tickerItems
    /*this.schedule.getCurrentReport().then((report) => {
      this.report = report
    })*/
  }

  ngOnChanges(changes) {
    this.updateTickerItems()
    if (this.tickerItems.length > 2) {
      setInterval(() => {
        this.iterateIndex()
      }, 7500)
    }
  }

  showNextTickerItem() {
    const style = `translateX(-${this.tickerIndex * 100}%)`
    return style
  }

  iterateIndex() {
    this.tickerIndex += 1
    if (this.tickerIndex === this.tickerItems.length) {
      this.tickerIndex = 0
      this.updateTickerItems()
    }
  }

  openReport() {
    this.updateReport()
    this.updateTickerItems()
    this.navCtrl.push(ReportPageComponent)
  }

  updateReport() {
    if (this.report) {
      const now = new Date()
      this.report['viewed'] = true
      this.report['firstViewedOn'] = now.getTime()
      this.schedule.updateReport(this.report)
    }
  }

  updateTickerItems() {
    this.tickerItems = []
    if (this.report) {
      this.addReportAvailable()
    }
    if (this.showAffirmation) {
      this.addAffirmation()
    }
    if (this.task['timestamp'] > 0) {
      this.addTask()
    }
    if (this.tickerItems.length === 0) {
      this.addTasksNone()
    }
    this.tickerItems = this.tickerItems.concat(this.items)
    this.tickerItems.push(this.tickerItems[0])
  }

  addReportAvailable() {
    if (this.report) {
      if (this.report['viewed'] === false) {
        const item = this.generateTickerItem(
          'report',
          '',
          'Report available! ',
          'Click to view.'
        )
        this.tickerItems.push(item)
      }
    }
  }

  addTask() {
    const now = new Date()
    const timeToNext = this.getTimeToNext(now.getTime(), this.task.timestamp)
    let item = this.generateTickerItem(
      'task',
      this.translate.transform(LocKeys.TASK_BAR_NEXT_TASK.toString()),
      timeToNext,
      '.'
    )
    if (timeToNext.includes('-')) {
      item = this.generateTickerItem(
        'task',
        this.translate.transform(LocKeys.TASK_BAR_NOW_TASK.toString()),
        this.translate.transform(LocKeys.STATUS_NOW.toString()),
        '.'
      )
    } else if (this.task.name === 'ESM') {
      item = this.generateTickerItem(
        'task',
        this.translate.transform(LocKeys.TASK_BAR_NOW_TASK.toString()),
        this.translate.transform(LocKeys.TASK_BAR_NEXT_TASK_SOON.toString()),
        '.'
      )
    }
    this.tickerItems.push(item)
  }

  addAffirmation() {
    const item = this.generateTickerItem(
      'affirmation',
      '',
      this.translate.transform(LocKeys.TASK_BAR_AFFIRMATION_1.toString()),
      this.translate.transform(LocKeys.TASK_BAR_AFFIRMATION_2.toString())
    )
    this.tickerItems.push(item)
  }

  addTasksNone() {
    const item = this.generateTickerItem(
      'tasks-none',
      '',
      this.translate.transform(LocKeys.TASK_BAR_TASK_LEFT_1.toString()),
      this.translate.transform(LocKeys.TASK_BAR_TASK_LEFT_2.toString())
    )
    this.tickerItems.push(item)
  }

  getTimeToNext(now, next) {
    let deltaStr = ''
    const deltaMin = Math.round((next - now) / 60000)
    const deltaHour = Math.round(deltaMin / 60)
    if (deltaMin > 59) {
      deltaStr =
        String(deltaHour) +
        ' ' +
        (deltaHour > 1
          ? this.translate.transform(LocKeys.TASK_TIME_HOUR_MULTIPLE.toString())
          : this.translate.transform(LocKeys.TASK_TIME_HOUR_SINGLE.toString()))
    } else {
      deltaStr =
        String(deltaMin) +
        ' ' +
        (deltaMin > 1
          ? this.translate.transform(
              LocKeys.TASK_TIME_MINUTE_MULTIPLE.toString()
            )
          : this.translate.transform(
              LocKeys.TASK_TIME_MINUTE_SINGLE.toString()
            ))
    }
    return deltaStr
  }

  generateTickerItem(id, t1, t2, t3): TickerItem {
    const item = {
      id: String(id),
      tickerText1: String(t1),
      tickerText2: String(t2),
      tickerText3: String(t3)
    }
    return item
  }
}
