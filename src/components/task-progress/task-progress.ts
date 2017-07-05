import { Component, ViewChild, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { HomeController } from '../../providers/home-controller'
import { RoundProgressConfig } from 'angular-svg-round-progressbar';
import { TasksProgress } from '../../models/task'


@Component({
  selector: 'task-progress',
  templateUrl: 'task-progress.html'
})
export class TaskProgressComponent {

  @Input() progress: TasksProgress
  @Input() forceComplete: boolean = false
  @Output() completed: EventEmitter<Boolean> = new EventEmitter()

  text: string;
  max: number = 1
  current: number = 0
  duration: number = 800
  complete: boolean = false
  showFireworks: boolean = false

  @ViewChild('progressActive')
  elActive: ElementRef
  @ViewChild('progressComplete')
  elComplete: ElementRef
  @ViewChild('checkmark')
  elCheckmark: ElementRef
  @ViewChild('counter')
  elCounter: ElementRef

  constructor(private progConfig: RoundProgressConfig,
              private controller: HomeController) {
    progConfig.setDefaults({
      'color':'#7fcdbb',
      'background': 'rgba(255,255,204,0.12)',
      'stroke': 22,
      'animation': 'easeInOutQuart',
      'duration': this.duration
    })
    this.controller.getTaskProgress().then((progress) => {
      this.progress = progress
      this.updateProgress()
    })
  }

  ngOnChanges() {
    this.updateProgress()
  }

  updateProgress () {
    if(this.progress){
      this.max = this.progress.numberOfTasks
      this.current = this.progress.completedTasks
    }
    if(this.current >= this.max){
      this.complete = true
      this.displayFireworks(800, 980)
    } else {
      this.complete = false
    }
    if(this.forceComplete){
      this.complete = true
    }
    this.transitionToComplete()
    this.completed.emit(this.complete)
  }

  transitionToComplete () {
    if(this.complete){
      this.elActive.nativeElement.style.transform =
      'translate3d(-100%,0,0) scale(0.1)'
      this.elComplete.nativeElement.style.transform =
      'translate3d(-100%,0,0) scale(1)'
      this.elCheckmark.nativeElement.style.transform =
      'scale(1)'
      this.elCounter.nativeElement.style.transform =
      'translate3d(0,250px,0)'
    } else {
      this.elActive.nativeElement.style.transform =
      'translate3d(0,0,0) scale(1)'
      this.elComplete.nativeElement.style.transform =
      'translate3d(0,0,0) scale(0.1)'
      this.elCheckmark.nativeElement.style.transform =
      'scale(5)'
      this.elCounter.nativeElement.style.transform =
      'translate3d(0,0,0)'
    }
  }

  displayFireworks (milliDelay, milliDisplay) {
    setTimeout(() => {
      this.showFireworks = true
      setTimeout(() => {
        this.showFireworks = false
      }, milliDisplay)
    }, milliDelay)
  }

  easterEggFireworks() {
    if(this.current >= this.max){
      this.displayFireworks(1, 980)
    }
  }

}
