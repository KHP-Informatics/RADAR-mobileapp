import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SeizureDiaryPage } from './seizure-diary';

import { ProtocolService } from '../../core/services/config/protocol.service'
import { TasksService } from '../home/services/tasks.service'
import { ScheduleGeneratorService } from '../../core/services/schedule/schedule-generator.service'
import { QuestionnaireService } from '../../core/services/config/questionnaire.service'

import { AlertService } from '../../core/services/misc/alert.service'
import { LocalizationService } from '../../core/services/misc/localization.service'

import { PipesModule } from '../../shared/pipes/pipes.module'
import { TranslatePipe } from '../../shared/pipes/translate/translate'

import { SeizureDiaryService } from './seizure-diary.service'

@NgModule({
  declarations: [
    SeizureDiaryPage,
  ],
  imports: [
    IonicPageModule.forChild(SeizureDiaryPage),
    PipesModule,
  ],
  providers: [
    ProtocolService,
    TasksService,
    ScheduleGeneratorService,
    QuestionnaireService,
    AlertService,
    LocalizationService,
    TranslatePipe,
    SeizureDiaryService,
  ]
})
export class SeizureDiaryModule {}
