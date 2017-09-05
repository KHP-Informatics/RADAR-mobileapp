export interface Answer {
  id: string
  value: any
}


// interface to submit answers to Kafka

export interface Response {
  value: any,
  startTime: number,
  endTime: number
}

export interface AnswerValueExport {
  type: any,
  version: number,
  answers: Response[],
  startTime: number,
  endTime: number
}

export interface AnswerKeyExport {
  userId: string,
  sourceId: string
}

// interface to submit answers to Kafka
