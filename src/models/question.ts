export interface Question {
  id: string
  lead: string
  content: string
  responses?: Response[]
  range?: Range
  type: string
}

export class QuestionType {
  static radio = 'radio'
  static range = 'range'
  static slider = 'slider'
  static audio = 'audio'
}

export interface Response {
  response: string
  score: number
}

export interface Range {
  min: number
  max: number
  step: number
}
