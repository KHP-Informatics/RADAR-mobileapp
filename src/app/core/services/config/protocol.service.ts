import {
  DefaultProtocolBranch,
  DefaultProtocolEndPoint,
  DefaultProtocolPath,
  DefaultQuestionnaireFormatURI,
  DefaultQuestionnaireTypeURI
} from '../../../../assets/data/defaultConfig'

import { Assessment } from '../../../shared/models/assessment'
import { ConfigKeys } from '../../../shared/enums/config'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { LogService } from '../misc/log.service'
import { RemoteConfigService } from './remote-config.service'
import { SubjectConfigService } from './subject-config.service'

@Injectable()
export class ProtocolService {
  constructor(
    private config: SubjectConfigService,
    private http: HttpClient,
    private remoteConfig: RemoteConfigService,
    private logger: LogService
  ) {}

  pull() {
    return this.remoteConfig
      .read()
      .catch(e => {
        throw this.logger.error('Failed to fetch Firebase config', e)
      })
      .then(cfg =>
        Promise.all([
          this.config.getProjectName(),
          cfg.getOrDefault(
            ConfigKeys.PROTOCOL_BASE_URL,
            DefaultProtocolEndPoint
          ),
          cfg.getOrDefault(ConfigKeys.PROTOCOL_PATH, DefaultProtocolPath),
          cfg.getOrDefault(ConfigKeys.PROTOCOL_BRANCH, DefaultProtocolBranch)
        ])
      )
      .then(([projectName, baseUrl, path, branch]) => {
        if (!projectName) {
          console.error(
            'Unknown project name : ' + projectName + '. Cannot pull protocols.'
          )
          return Promise.reject()
        }
        const URI = [baseUrl, projectName, `${path}?ref=${branch}`].join('/')
        return this.http.get(URI).toPromise()
      })
      .then(res => atob(res['content']))
  }

  format(protocols: Assessment[]): Assessment[] {
    return protocols.map(p => {
      p.questionnaire.type = DefaultQuestionnaireTypeURI
      p.questionnaire.format = DefaultQuestionnaireFormatURI
      return p
    })
  }
}
