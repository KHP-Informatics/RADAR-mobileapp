import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { StorageService } from '../providers/storage-service'
import { StorageKeys } from '../enums/storage'
import { SchedulingService } from '../providers/scheduling-service'
import { DefaultProtocolEndPoint } from '../assets/data/defaultConfig'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ConfigService {

  URI_protocol: string = '/protocol.json'
  URI_questionnaireType: string = '_armt'
  URI_questionnaireFormat: string = '.json'

  constructor(
    public http: HttpClient,
    private storage: StorageService,
    private schedule: SchedulingService,
  ) {}

  fetchConfigState() {
    this.storage.get(StorageKeys.CONFIG_VERSION)
    .then((version) => {
      this.pullProtocol()
      .then((res) => {
        let response: any = JSON.parse(res)
        if(version != response.version) {
          let protocolFormated = this.formatPulledProcotol(response.protocols)
          this.storage.set(StorageKeys.CONFIG_VERSION, response.version)
          this.storage.set(StorageKeys.CONFIG_ASSESSMENTS, protocolFormated)
          .then(() =>{
            console.log("Pulled questionnaire")
            this.pullQuestionnaires()
            this.schedule.generateSchedule()
          })
        } else {
          console.log('NO CONFIG UPDATE. Version of protocol.json has not changed.')
        }
      }).catch(e => console.log(e))
    })
  }

  pullProtocol() {
    return this.getProjectName().then((projectName) => {
      if(projectName){
        let URI = DefaultProtocolEndPoint + projectName + this.URI_protocol
        return this.http.get(URI, { responseType: 'text'} ).toPromise()
      } else {
        console.error('Unknown project name. Cannot pull protocols.')
      }
    })
  }

  getProjectName() {
    return this.storage.get(StorageKeys.PROJECTNAME)
  }

  formatPulledProcotol(protocols) {
    var protocolsFormated = protocols
    for(var i = 0; i<protocolsFormated.length; i++){
      protocolsFormated[i].questionnaire['type'] = this.URI_questionnaireType
      protocolsFormated[i].questionnaire['format'] = this.URI_questionnaireFormat
    }
    return protocolsFormated
  }

  retrieveLanguageKeys(questionnaire_URI) {
    var langs = []
    for(var key in questionnaire_URI) langs.push(key)
    var langsKeyValEmpty = {}
    for(var val of langs) langsKeyValEmpty[val] = ""
    return langsKeyValEmpty
  }

  pullQuestionnaires() {
    let assessments = this.storage.get(StorageKeys.CONFIG_ASSESSMENTS)
    let lang = this.storage.get(StorageKeys.LANGUAGE)
    Promise.all([assessments, lang])
    .then((vars) => {
      let assessments = vars[0]
      let lang = vars[1]

      let promises = []
      for(var i = 0; i < assessments.length; i++) {
        promises.push(this.pullQuestionnaireLang(assessments[i], lang))
      }
      Promise.all(promises)
      .then((res) => {
        let assessmentUpdate = assessments
        for(var i = 0; i < assessments.length; i++) {
          assessmentUpdate[i]['questions'] = this.formatQuestionsHeaders(res[i])
        }
        this.storage.set(StorageKeys.CONFIG_ASSESSMENTS, assessmentUpdate)
      })
    })
  }

  pullQuestionnaireLang(assessment, lang) {
    let uri = this.formatQuestionnaireUri(assessment.questionnaire, lang.value)
    return this.getQuestionnairesOfLang(uri)
    .catch(e => {
      let uri = this.formatQuestionnaireUri(assessment.questionnaire, '')
      return this.getQuestionnairesOfLang(uri)
    })
  }

  formatQuestionnaireUri(questionnaireRepo, langVal) {
    var uri = questionnaireRepo.repository + questionnaireRepo.name + '/'
    uri += questionnaireRepo.name + questionnaireRepo.type
    if(langVal != '') {
      uri += '_' + langVal
    }
    uri += questionnaireRepo.format
    console.log(uri)
    return uri
  }

  getQuestionnairesOfLang(URI) {
    return this.http.get(URI).toPromise()
  }

  formatQuestionsHeaders(questions) {
    var questionsFormated = questions
    let sectionHeader = questionsFormated[0].section_header
    for(var i = 0; i < questionsFormated.length; i++){
      if(questionsFormated[i].section_header == "") {
        questionsFormated[i].section_header = sectionHeader
      } else {
        sectionHeader = questionsFormated[i].section_header
      }
    }
    return questionsFormated
  }

}
