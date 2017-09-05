import { NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpModule } from '@angular/http'
import { MomentModule } from 'angular2-moment'
import { DatePipe } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { SplashScreen } from '@ionic-native/splash-screen'
import { Device } from '@ionic-native/device'
import { StatusBar } from '@ionic-native/status-bar'
import { IonicApp, IonicModule } from 'ionic-angular'
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { IonicStorageModule } from '@ionic/storage';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { BarcodeScanner } from '@ionic-native/barcode-scanner'
import { AndroidPermissions } from '@ionic-native/android-permissions';

import { TaskCalendarComponent } from '../components/task-calendar/task-calendar'
import { TaskProgressComponent } from '../components/task-progress/task-progress'
import { TickerBarComponent } from '../components/ticker-bar/ticker-bar'
import { TaskInfoComponent } from '../components/task-info/task-info'
import { QuestionComponent } from '../components/question/question'
import { AudioInputComponent } from '../components/audio-input/audio-input'
import { RadioInputComponent } from '../components/radio-input/radio-input'
import { RangeInputComponent } from '../components/range-input/range-input'
import { SliderInputComponent } from '../components/slider-input/slider-input'
import { EnrolmentPage } from '../pages/enrolment/enrolment'
import { FinishPage } from '../pages/finish/finish'
import { HomePage } from '../pages/home/home'
import { SettingsPage } from '../pages/settings/settings'
import { StartPage } from '../pages/start/start'
import { TaskSelectPage } from '../pages/taskselect/taskselect'
import { QuestionsPage } from '../pages/questions/questions'
import { ReportPage } from '../pages/report/report'
import { HomeController } from '../providers/home-controller'
import { AnswerService } from '../providers/answer-service'
import { QuestionService } from '../providers/question-service'
import { FirebaseService } from '../providers/firebase-service'
import { StorageService } from '../providers/storage-service'
import { SchedulingService } from '../providers/scheduling-service'
import { FirebaseConfig } from '../assets/data/defaultConfig'
import { KafkaService } from '../providers/kafka-service'
import { TimeStampService } from '../providers/timestamp-service'
import { PrepareDataService } from '../providers/preparedata-service'
import { AudioRecordService } from '../providers/audiorecord-service'
import { Utility } from '../utilities/util'
import { AndroidPermissionUtility } from '../utilities/android-permission'
import { MyApp } from './app.component';


@NgModule({
  imports: [
    HttpModule,
    MomentModule,
    BrowserModule,
    RoundProgressModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp, {
      mode: 'md'
    }),
    IonicStorageModule.forRoot({
      name: '__appdb',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    AngularFireModule.initializeApp(FirebaseConfig),
    AngularFireDatabaseModule, // imports firebase/database, only needed for database features
    AngularFireAuthModule // imports firebase/auth, only needed for auth features
  ],
  declarations: [
    MyApp,

    // Pages
    EnrolmentPage,
    HomePage,
    StartPage,
    QuestionsPage,
    FinishPage,
    SettingsPage,
    TaskSelectPage,
    ReportPage,

    // Components
    TaskCalendarComponent,
    TaskProgressComponent,
    TickerBarComponent,
    TaskInfoComponent,
    QuestionComponent,
    RangeInputComponent,
    RadioInputComponent,
    SliderInputComponent,
    AudioInputComponent
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,

    // Pages
    EnrolmentPage,
    HomePage,
    StartPage,
    QuestionsPage,
    FinishPage,
    SettingsPage,
    TaskSelectPage,
    ReportPage,

    // Components
    TaskProgressComponent,
    TickerBarComponent,
    TaskInfoComponent,
    QuestionComponent,
    RangeInputComponent,
    RadioInputComponent,
    SliderInputComponent,
    AudioInputComponent
  ],
  providers: [
    Device,
    StatusBar,
    SplashScreen,
    DatePipe,
    AndroidPermissions,
    QuestionService,
    AnswerService,
    FirebaseService,
    StorageService,
    AngularFireDatabaseModule,
    KafkaService,
    TimeStampService,
    PrepareDataService,
    Utility,
    SchedulingService,
    AudioRecordService,
    AngularFireDatabaseModule,
    HomeController,
    BarcodeScanner,
    AndroidPermissionUtility
  ]
})
export class AppModule {
}
