<template>
  <div v-if="!surveyStarted" class="start-screen glass-panel">
    <h2>Добро пожаловать в опросник</h2>
    <button @click="startSurvey" class="submit-btn">
      Начать опрос
    </button>
  </div>

  <div v-else-if="questions.length > 0" class="question-container glass-panel">
    <div v-for="(question, qIndex) in questions" :key="question.id" class="question">
      <h2>{{ question.text }}</h2>

      <div v-if="question.options" class="options">
        <button
            v-for="option in question.options"
            :key="option.id"
            @click="selectOption(question.id, option)"
            :class="{ 'selected': isOptionSelected(question.id, option.id) }"
            class="option-btn"
        >
          {{ option.text }}
        </button>
      </div>

      <div v-else class="actions">
        <button
            @click="fetchNextQuestion(question.id)"
            class="submit-btn"
            :disabled="!hasSelection(question.id)"
        >
          {{ question.buttonText || 'Далее' }}
        </button>
      </div>
    </div>
  </div>

  <div v-else class="completion-screen glass-panel">
    <h2>Опрос завершен!</h2>
    <p>Спасибо за ваши ответы</p>
    <div class="summary" v-if="selectedAnswers.length > 0">
      <h3>Ваши ответы:</h3>
      <ul>
        <li v-for="(answer, index) in selectedAnswers" :key="index">
          Вопрос {{ answer.questionId }}: {{ answer.optionText }}
        </li>
      </ul>
    </div>
    <button @click="resetSurvey" class="submit-btn">
      Пройти еще раз
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const surveyStarted = ref(false)
const questions = ref([])
const selectedAnswers = ref([])
const questionHistory = ref([])

// Загрузка сохраненных ответов при старте
onMounted(() => {
  const savedAnswers = localStorage.getItem('surveyAnswers')
  if (savedAnswers) {
    selectedAnswers.value = JSON.parse(savedAnswers)
  }
})

const startSurvey = async () => {
  surveyStarted.value = true
  await fetchQuestions()
}

const fetchQuestions = async (id = null) => {
  try {
    const url = id ? `http://localhost:8080/${id}` : 'http://localhost:8080/'
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Ответ сервера:', data)

    if (Array.isArray(data) && data.length > 0) {
      questions.value = data.map(item => ({
        id: item.id,
        text: item.text,
        options: item.storage?.options || null,
        buttonText: item.storage?.buttonText || null
      }))

      questionHistory.value.push(...data.map(q => q.id))
    } else {
      questions.value = []
    }
  } catch (error) {
    console.error('Ошибка при загрузке вопросов:', error)
    questions.value = [{
      id: 'error',
      text: 'Произошла ошибка при загрузке вопросов',
      options: null,
      buttonText: 'Попробовать снова'
    }]
  }
}

const selectOption = (questionId, option) => {
  // Удаляем предыдущий ответ на этот вопрос если был
  selectedAnswers.value = selectedAnswers.value.filter(
      a => a.questionId !== questionId
  )

  // Добавляем новый ответ
  selectedAnswers.value.push({
    questionId,
    questionText: questions.value.find(q => q.id === questionId)?.text,
    optionId: option.id,
    optionText: option.text,
    timestamp: new Date().toISOString()
  })

  // Сохраняем в localStorage
  localStorage.setItem('surveyAnswers', JSON.stringify(selectedAnswers.value))
}

const isOptionSelected = (questionId, optionId) => {
  return selectedAnswers.value.some(
      a => a.questionId === questionId && a.optionId === optionId
  )
}

const hasSelection = (questionId) => {
  return questions.value.find(q => q.id === questionId)?.options
      ? selectedAnswers.value.some(a => a.questionId === questionId)
      : true
}

const fetchNextQuestion = async (questionId) => {
  await fetchQuestions(questionId)
}

const resetSurvey = () => {
  surveyStarted.value = false
  questions.value = []
  selectedAnswers.value = []
  questionHistory.value = []
  localStorage.removeItem('surveyAnswers')
}
</script>

<style scoped>
.start-screen,
.question-container,
.completion-screen {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
}

h2 {
  margin-bottom: 30px;
  color: var(--primary);
}

.question {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--glass-border);
}

.question:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.option-btn {
  padding: 15px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.option-btn:hover {
  background: rgba(110, 69, 226, 0.1);
  transform: translateY(-2px);
}

.option-btn.selected {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 15px rgba(110, 69, 226, 0.3);
}

.submit-btn {
  margin-top: 30px;
  padding: 15px 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(110, 69, 226, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.summary {
  margin: 30px 0;
  text-align: left;
  background: var(--glass);
  padding: 20px;
  border-radius: 10px;
}

.summary h3 {
  color: var(--accent);
  margin-bottom: 15px;
}

.summary ul {
  list-style-type: none;
  padding: 0;
}

.summary li {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--glass-border);
}
</style>