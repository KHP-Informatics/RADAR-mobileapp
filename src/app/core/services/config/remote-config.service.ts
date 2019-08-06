import 'rxjs/add/operator/mergeMap'

import { BehaviorSubject, Observable, from } from 'rxjs'

import { ConfigKeys } from '../../../shared/enums/config'
import { Firebase } from '@ionic-native/firebase/ngx'
import { Injectable } from '@angular/core'
import { LogService } from '../misc/log.service'
import { StorageKeys } from '../../../shared/enums/storage'
import { StorageService } from '../storage/storage.service'

declare var FirebasePlugin

@Injectable()
export class RemoteConfigService {
  protected timeoutMillis: number = 14_400_000

  constructor(private storage: StorageService) {
    this.storage.get(StorageKeys.REMOTE_CONFIG_CACHE_TIMEOUT)
      .then(timeout => {
        if (timeout) {
          this.timeoutMillis = timeout
        } else {
          this.timeoutMillis = 14_400_000  // 3 hours
          return this.storage.set(StorageKeys.REMOTE_CONFIG_CACHE_TIMEOUT, this.timeoutMillis)
        }
      })
  }

  setCacheExpiration(timeoutMillis: number): Promise<number> {
    return this.storage.set(StorageKeys.REMOTE_CONFIG_CACHE_TIMEOUT, timeoutMillis)
      .then(timeout => {
        if (timeout) {
          this.timeoutMillis = timeout
        }
        return timeoutMillis
      })
  }

  read(): Promise<RemoteConfig> {
    throw new Error('RemoteConfigService method not implemented')
  }

  forceFetch(): Promise<RemoteConfig> {
    throw new Error('RemoteConfigService method not implemented')
  }

  subject(): Observable<RemoteConfig> {
    throw new Error('RemoteConfigService method not implemented')
  }
}

export interface RemoteConfig {
  get(key: ConfigKeys): Promise<any>
  getOrDefault(key: ConfigKeys, defaultValue: any): Promise<any>
}

class FirebaseRemoteConfig implements RemoteConfig {
  constructor(private logger: LogService) {}

  get(key: ConfigKeys): Promise<string | null> {
    // workaround for incompatibility
    // @ionic-native/firebase + cordova-plugin-firebase-with-upstream-messaging
    return new Promise((resolve, reject) => {
      FirebasePlugin.getValue(key.value, res => resolve(res), e => reject(e))
    })
  }

  getOrDefault(key: ConfigKeys, defaultValue: string): Promise<string> {
    console.log(`Retrieving ${key.value}`)
    return this.get(key)
      .then((val: string) => (val.length == 0 ? defaultValue : val))
      .catch(e => {
        this.logger.error(
          `Failed to retrieve ${key.value}. Using default ${defaultValue}.`, e)
        return defaultValue
      })
  }
}

@Injectable()
export class FirebaseRemoteConfigService extends RemoteConfigService {
  private lastFetch: number = 0
  private readonly configSubject: BehaviorSubject<RemoteConfig>

  constructor(
    private firebase: Firebase,
    storage: StorageService,
    private logger: LogService,
  ) {
    super(storage)
    this.configSubject = new BehaviorSubject(
      new FirebaseRemoteConfig(this.logger)
    )
  }

  forceFetch(): Promise<RemoteConfig> {
    return this.fetch(0)
  }

  read(): Promise<RemoteConfig> {
    if (this.lastFetch + this.timeoutMillis >= new Date().getTime()) {
      return Promise.resolve(this.configSubject.value)
    }

    return this.fetch(this.timeoutMillis)
  }

  private fetch(timeoutMillis: number) {
    console.log('Fetching Firebase Remote Config')
    return this.firebase
      .fetch(timeoutMillis)
      .then(() => {
        console.log('Activating Firebase Remote Config')
        return this.firebase.activateFetched()
          // iOS workaround for when activateFetched is false.
          .catch(e => false)
      })
      .then(activated => {
        console.log('New Firebase Remote Config did activate', activated)
        const conf = new FirebaseRemoteConfig(this.logger)
        if (activated) {
          this.configSubject.next(conf)
        }
        this.lastFetch = new Date().getTime()
        return conf
      })
  }

  subject(): Observable<RemoteConfig> {
    if (this.lastFetch == 0) {
      return from(this.read()).mergeMap(() => this.configSubject)
    } else {
      return this.configSubject
    }
  }
}
