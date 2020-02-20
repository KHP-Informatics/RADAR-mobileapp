import { TestBed } from '@angular/core/testing'
import { Firebase } from '@ionic-native/firebase/ngx'
import { Platform } from 'ionic-angular'
import { PlatformMock } from 'ionic-mocks'

import {
  FcmNotificationControllerServiceMock,
  FirebaseMock,
  LocalizationServiceMock,
  LogServiceMock,
  NotificationGeneratorServiceMock,
  RadarProjectControllerServiceMock,
  RadarUserControllerServiceMock,
  RemoteConfigServiceMock,
  ScheduleServiceMock,
  StorageServiceMock,
  SubjectConfigServiceMock
} from '../../../shared/testing/mock-services'
import {
  FcmNotificationControllerService,
  RadarProjectControllerService,
  RadarUserControllerService
} from '../app-server/api'
import { RemoteConfigService } from '../config/remote-config.service'
import { SubjectConfigService } from '../config/subject-config.service'
import { LocalizationService } from '../misc/localization.service'
import { LogService } from '../misc/log.service'
import { ScheduleService } from '../schedule/schedule.service'
import { StorageService } from '../storage/storage.service'
import { FcmNotificationService } from './fcm-notification.service'
import { NotificationGeneratorService } from './notification-generator.service'

describe('FcmNotificationService', () => {
  let service

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        FcmNotificationService,
        { provide: Platform, useClass: PlatformMock },
        { provide: Firebase, useClass: FirebaseMock },
        { provide: LogService, useClass: LogServiceMock },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: SubjectConfigService, useClass: SubjectConfigServiceMock },
        {
          provide: NotificationGeneratorService,
          useClass: NotificationGeneratorServiceMock
        },
        { provide: ScheduleService, useClass: ScheduleServiceMock },
        { provide: RemoteConfigService, useClass: RemoteConfigServiceMock },
        {
          provide: FcmNotificationControllerService,
          useClass: FcmNotificationControllerServiceMock
        },
        {
          provide: RadarUserControllerService,
          useClass: RadarUserControllerServiceMock
        },
        {
          provide: RadarProjectControllerService,
          useClass: RadarProjectControllerServiceMock
        },
        { provide: LocalizationService, useClass: LocalizationServiceMock }
      ]
    })
  )

  beforeEach(() => {
    service = TestBed.get(FcmNotificationService)
  })

  it('should create', () => {
    expect(service instanceof FcmNotificationService).toBe(true)
  })
})
