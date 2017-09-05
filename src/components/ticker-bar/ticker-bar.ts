import { Component, Input, OnChanges,  } from '@angular/core'
import { NavController } from 'ionic-angular'
import { SchedulingService } from '../../providers/scheduling-service'
import { StorageKeys } from '../../enums/storage'
import { Task } from '../../models/task'
import { TickerItem } from '../../models/ticker'
import { ReportScheduling } from '../../models/report'
import { ReportPage } from '../../pages/report/report'

@Component({
  selector: 'ticker-bar',
  templateUrl: 'ticker-bar.html'
})
export class TickerBarComponent implements OnChanges {

  @Input() task: Task
  @Input() items: TickerItem[] = []
  @Input() showAffirmation: boolean = false
  tickerItems: TickerItem[]
  tickerIndex: number = 0
  report: ReportScheduling

  hasTask: boolean = true
  tickerWeeklyReport: string
  newWeeklyReport: boolean = false

  constructor(private schedule: SchedulingService,
              private navCtrl: NavController) {
    this.schedule.getCurrentReport().then((report) => {
      this.report = report
    })
  }

  ngOnChanges (changes) {
    this.updateTickerItems()
    if(this.tickerItems.length > 2){
      setInterval(() => {
        this.iterateIndex()
      }, 7500)
    }
  }

  showNextTickerItem () {
    let style = `translateX(-${this.tickerIndex * 100}%)`
    return style
  }

  iterateIndex () {
    this.tickerIndex += 1
    if(this.tickerIndex == (this.tickerItems.length)) {
      this.tickerIndex = 0
      this.updateTickerItems()
    }
  }

  openReport () {
    this.updateReport()
    this.updateTickerItems()
    this.navCtrl.push(ReportPage)
  }

  updateReport () {
    let now = new Date()
    this.report['viewed'] = true
    this.report['firstViewedOn'] = now.getTime()
    this.schedule.updateReport(this.report)
  }

  updateTickerItems () {
    this.tickerItems = []
    if(this.report) {
      this.addReportAvailable()
    }
    if(this.showAffirmation){
      this.addAffirmation()
    }
    if(this.task['timestamp'] > 0){
      this.addTask()
    }
    if(this.tickerItems.length == 0){
      this.addTasksNone()
    }
    this.tickerItems = this.tickerItems.concat(this.items)
    this.tickerItems.push(this.tickerItems[0])
  }

  addReportAvailable () {
    if(this.report['viewed']==false){
      let item = this.generateTickerItem('report', '', 'Report available! ', 'Click to view.')
      this.tickerItems.push(item)
    }
  }

  addTask () {
    let now = new Date()
    let timeToNext = this.getTimeToNext(now.getTime(), this.task.timestamp)
    let item = this.generateTickerItem('task', 'Your next task starts in ', timeToNext, '.')
    this.tickerItems.push(item)
  }

  addAffirmation () {
    let item = this.generateTickerItem('affirmation', '', 'Well done! ', 'All tasks completed.')
    this.tickerItems.push(item)
  }

  addTasksNone () {
    let item = this.generateTickerItem('tasks-none', '', 'Timeout! ', 'No tasks today.')
    this.tickerItems.push(item)
  }

  getTimeToNext (now, next) {
    var deltaStr = ''
    let deltaMin = Math.round((next-now)/60000)
    let deltaHour = Math.round(deltaMin / 60)
    if(deltaMin > 59) {
      deltaStr = deltaHour > 1 ? String(deltaHour)+'hrs' : String(deltaHour)+'hr'
    } else {
      deltaStr = String(deltaMin)+'min'
    }
    return deltaStr
  }

  generateTickerItem (id, t1, t2, t3): TickerItem {
    let item = {
      'id': String(id),
      'tickerText1': String(t1),
      'tickerText2': String(t2),
      'tickerText3': String(t3),
    }
    return item
  }
}
