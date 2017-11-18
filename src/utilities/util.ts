

import { Injectable } from '@angular/core'
import { Device } from '@ionic-native/device'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map'
import { Http, Response } from '@angular/http'
import { StorageService } from '../providers/storage-service'
import { StorageKeys } from '../enums/storage'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { DefaultEndPoint } from '../assets/data/defaultConfig'

@Injectable()
export class Utility {

  URI_schema:string = '/schema/subjects/'
  URI_version:string = '/versions/'

  constructor(
    private httpClient: HttpClient,
    private http: Http,
    private device: Device,
    private storage: StorageService
  ) {
  }

  getSchema(schemaUrl) {
    return this.http.get(schemaUrl)
      .map(this.extractData)
      .catch(this.handleError)
  }


  getDevice() {
    if (this.device.platform == undefined || null) {
      return {
        "isDeviceReady": false,
        "device": this.device
      }
    } else {
      return {
        "isDeviceReady": true,
        "device": this.device
      }
    }
  }

  private extractData(res: Response) {
    const body = res.json()
    return body || []

  }

  private handleError(error: Response | any) {
    let errMsg: string

    if (error instanceof Response) {
      const body = error.json() || ''
      const err = body.error || JSON.stringify(body)
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`
    } else {
      errMsg = error.message
        ? error.message
        : error.toString()
    }

    console.error(errMsg)
    return Observable.throw(errMsg)
  }

  getSourceId() {
    return this.storage.get(StorageKeys.SOURCEID)
  }


  getLatestKafkaSchemaVersions(questionnaireName:string) {
    let qKey = 'questionnaire_' + questionnaireName.toLowerCase() + '-key'
    let qVal = 'questionnaire_' + questionnaireName.toLowerCase() + '-value'
    return this.storage.get(StorageKeys.OAUTH_TOKENS)
    .then(tokens => {
      let key = this.getLatestKafkaSchemaVersion(tokens.access_token, qKey)
      let val = this.getLatestKafkaSchemaVersion(tokens.access_token, qVal)
      return Promise.all([key, val])
    })
  }

  getLatestKafkaSchemaVersion(accessToken, questionName) {
    let uri = DefaultEndPoint + this.URI_schema + questionName + this.URI_version
    var headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + accessToken)
    return this.httpClient.get(uri, { headers }).toPromise()
  }

}
