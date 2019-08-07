import { AnswerService } from './answer.service'
import { Injectable } from '@angular/core'
import { QuestionnaireService } from '../../../core/services/config/questionnaire.service'
import { TimestampService } from './timestamp.service'
import { UsageEventType } from '../../../shared/enums/events'
import { UsageService } from '../../../core/services/usage/usage.service'
import { getSeconds } from '../../../shared/utilities/time'
@Injectable()
export class QuestionsService {
  constructor(
    public questionnaire: QuestionnaireService,
    private answerService: AnswerService,
    private timestampService: TimestampService,
    private usage: UsageService
  ) {}

  reset() {
    this.answerService.reset()
    this.timestampService.reset()
  }

  deleteLastAnswer() {
    this.answerService.pop()
  }

  submitAnswer(answer) {
    this.answerService.add(answer)
  }

  getData() {
    return {
      answers: this.getAnswers(),
      timestamps: this.timestampService.timestamps
    }
  }

  getAttemptedAnswers() {
    return this.answerService.answers
  }

  getAnswers() {
    const answers = {}
    this.answerService.keys.map(
      d => (answers[d] = this.answerService.answers[d])
    )
    return answers
  }

  getTime() {
    return getSeconds({ milliseconds: this.timestampService.getTimeStamp() })
  }

  updateAssessmentIntroduction(assessment, taskType) {
    if (assessment.showIntroduction) {
      assessment.showIntroduction = false
      this.questionnaire.updateAssessment(taskType, assessment)
    }
  }

  showESMSleepQuestion() {
    // Note: First ESM will show sleep question
    return new Date().getHours() <= 9
  }

  showESMRatingQuestion() {
    // Note: Last ESM will show rating question
    // TODO: Fix hardcoded values
    return new Date().getHours() >= 19
  }

  isESM(title) {
    return title === 'ESM'
  }

  processQuestions(title, questions: any[]) {
    if (this.isESM(title)) {
      const length = questions.length
      const first = this.showESMSleepQuestion() ? 0 : 1
      const last = this.showESMRatingQuestion() ? length - 1 : length - 2
      return questions.slice(first, last)
    }
    return questions
  }

  checkAnswer(id) {
    return this.answerService.check(id)
  }

  evalSkipNext(questions, currentQuestion) {
    // NOTE: Evaluates branching logic
    let increment = 1
    let questionIdx = currentQuestion + 1
    if (questionIdx < questions.length) {
      while (questions[questionIdx].evaluated_logic !== '') {
        const responses = Object.assign({}, this.answerService.answers)
        const logic = questions[questionIdx].evaluated_logic
        const logicFieldName = this.getLogicFieldName(logic)
        const answers = this.answerService.answers[logicFieldName]
        const answerLength = answers.length
        if (!answerLength) if (eval(logic) === true) return increment
        for (const answer of answers) {
          responses[logicFieldName] = answer
          if (eval(logic) === true) return increment
        }
        increment += 1
        questionIdx += 1
      }
    }
    return increment
  }

  getLogicFieldName(logic) {
    return logic.split("['")[1].split("']")[0]
  }

  getNextQuestion(questions, currentQuestion) {
    return this.evalSkipNext(questions, currentQuestion)
  }

  getAnswerProgress(current, total) {
    return Math.ceil((current * 100) / total)
  }

  getAttemptProgress(total) {
    const answers = this.answerService.answers
    const attemptedAnswers = Object.keys(answers)
      .map(d => (answers[d] ? answers[d] : null))
      .filter(a => a)
    return Math.ceil((attemptedAnswers.length * 100) / total)
  }

  recordTimeStamp(questionId, startTime) {
    this.timestampService.add({
      id: questionId,
      value: {
        startTime: startTime,
        endTime: this.getTime()
      }
    })
  }

  sendCompletionLog(task, totalQuestions) {
    this.usage.sendCompletionLog(task, this.getAttemptProgress(totalQuestions))
  }

  sendCloseEvent(task) {
    this.usage.sendQuestionnaireEvent(
      UsageEventType.QUESTIONNAIRE_STARTED,
      task
    )
  }
}
