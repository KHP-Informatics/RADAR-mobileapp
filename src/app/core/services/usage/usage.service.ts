import { FirebaseAnalyticsService } from './firebase-analytics.service'
import { Injectable } from '@angular/core'
import { KafkaService } from '../kafka/kafka.service'
import { SchemaType } from '../../../shared/models/kafka'
import { UsageEventType } from '../../../shared/enums/events'
import { WebIntent } from '@ionic-native/web-intent/ngx'
import { LogService } from '../misc/log.service'

@Injectable()
export class UsageService {
  constructor(
    private webIntent: WebIntent,
    private kafka: KafkaService,
    private firebaseAnalytics: FirebaseAnalyticsService,
    private logger: LogService,
  ) {}

  sendEventToKafka(payload) {
    return this.kafka.prepareKafkaObjectAndSend(SchemaType.USAGE, payload, true)
  }

  sendOpenEvent() {
    return this.webIntent.getIntent().then(intent => {
      this.logger.log(intent)
      // noinspection JSIgnoredPromiseFromCall
      this.sendEventToKafka({
        eventType: intent.extras
          ? UsageEventType.APP_OPEN_NOTIFICATION
          : UsageEventType.APP_OPEN_DIRECTLY
      })
    })
  }

  sendQuestionnaireEvent(type, task) {
    // noinspection JSIgnoredPromiseFromCall
    this.firebaseAnalytics.logEvent(type, {
      questionnaire_timestamp: task.timestamp
        ? String(task.timestamp)
        : Date.now(),
      type: task.name
    })
    return this.sendEventToKafka({
      eventType: type,
      questionnaireType: task.name
    })
  }

  sendGeneralEvent(type, payload?) {
    // noinspection JSIgnoredPromiseFromCall
    this.firebaseAnalytics.logEvent(type, payload ? payload : {})
  }

  sendClickEvent(button) {
    // noinspection JSIgnoredPromiseFromCall
    this.firebaseAnalytics.logEvent(UsageEventType.CLICK, { button: button })
  }

  sendCompletionLog(task, percent) {
    const keepInCache = percent == 0
    return this.kafka.prepareKafkaObjectAndSend(
      SchemaType.COMPLETION_LOG,
      {
        name: task.name,
        percentage: percent,
        timeNotification: task.timestamp
      },
      keepInCache
    )
  }

  setPage(component) {
    // Note: This converts QuestionsPageComponent to questions-page
    let page = component.split(/(?=[A-Z])/)
    page.pop()
    page = page.join('-').toLowerCase()
    // noinspection JSIgnoredPromiseFromCall
    this.firebaseAnalytics.setCurrentScreen(page)
  }
}
