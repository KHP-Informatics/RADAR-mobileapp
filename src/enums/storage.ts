export class StorageKeys {

    constructor(public value:string){
    }
    toString(){
        return this.value;
    }
    // values
    static REFERENCEDATE = new StorageKeys('REFERENCEDATE');
    static PATIENTID = new StorageKeys('PATIENTID');
    static LANGUAGE = new StorageKeys('LANGUAGE');
    static SETTINGS_NOTIFICATIONS = new StorageKeys('SETTINGS_NOTIFICATIONS');
    static SETTINGS_LANGUAGES = new StorageKeys('SETTINGS_LANGUAGES');
    static SETTINGS_WEEKLYREPORT = new StorageKeys('SETTINGS_WEEKLYREPORT')
    static CONFIG_VERSION = new StorageKeys('CONFIG_VERSION')
    static CONFIG_ASSESSMENTS = new StorageKeys('CONFIG_ASSESSMENTS')
    static SCHEDULE_VERSION = new StorageKeys('SCHEDULE_VERSION')
    static SCHEDULE_TASKS = new StorageKeys('SCHEDULE_TASKS')
}
