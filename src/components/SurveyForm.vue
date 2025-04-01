<template>
  <div v-if="!surveyStarted" class="user-data glass-panel">
    <h2>Введите ваши данные</h2>
    <div class="form-group">
      <label>Имя:</label>
      <input v-model="userData.firstName" type="text" placeholder="Ваше имя">
    </div>
    <div class="form-group">
      <label>Фамилия:</label>
      <input v-model="userData.lastName" type="text" placeholder="Ваша фамилия">
    </div>
    <div class="form-group">
      <label>Email:</label>
      <input v-model="userData.email" type="email" placeholder="Ваш email">
    </div>
    <button @click="startSurvey" class="submit-btn" >
      Начать опрос
    </button>
  </div>

  <div v-else-if="currentStep.value === 2" class="question-container glass-panel">
    <h2>Выберите:</h2>
    <div v-for="question in questions" class="question">
        <button
            :key="question.id"
            @click="selectOption(currentQuestionIndex, question)"
            class="submit-btn"
        >
          {{ question.text }}
        </button>
    </div>
    <button v-if="currentQuestionIndex > 0" @click="prevQuestion()" class="nav-btn">
      ← Назад
    </button>
  </div>

  <div v-else class="completion-screen glass-panel">
    <p>Спасибо за ваши ответы, {{ userData.firstName }}</p>
    <div class="summary" v-if="selectedAnswers.length > 0">
      <h3>Ваши ответы:</h3>
      <ul>
        <li v-for="(answer, index) in selectedAnswers" :key="index">
          Выбор: {{ answer.questionId }}: {{ answer.optionText }}
        </li>
      </ul>
    </div>
    <button @click="completeSurvey()" class="submit-btn">
      Пройти еще раз
    </button>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'

const surveyStarted = ref(false)
const currentStep = ref(1)
const currentQuestionIndex = ref(0)

const questions = ref([])
const selectedAnswers = ref([])
const questionHistory = ref([])

const userData = ref({
  firstName: '',
  lastName: '',
  email: ''
})


const isUserDataValid = computed(() => {
  return userData.value.firstName.trim() !== '' &&
      userData.value.lastName.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.value.email)
})

// Вычисляемые свойства
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {}
})

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

// Загрузка сохраненных ответов при старте
onMounted(() => {
  const savedAnswers = localStorage.getItem('surveyAnswers')
  if (savedAnswers) {
    const data = JSON.parse(savedAnswers)
    userData.value = data.userData || userData.value
    selectedAnswers.value = data.answers || []

    if (data.questions && data.questions.length > 0) {
      questions.value = data.questions
      currentStep.value = 2
    }
  }
})

const allQuestionsAnswered = computed(() => {
  return questions.value.every(q =>
      selectedAnswers.value.some(a => a.questionId === q.id)
  )
})

const startSurvey = async () => {
  surveyStarted.value = true
  await fetchQuestions()
}

const fetchQuestions = async (id = null) => {
  try {
    const url = id ? `http://localhost:8080/to/${id}` : 'http://localhost:8080/'
    const response = await fetch(url)

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    console.log('Ответ сервера:', data)

    if (Array.isArray(data) && data.length > 0) {
      questions.value = data.map(item => ({
        id: item.id,
        text: item.text,
        options: item.storage?.options || null
      }))
    } else {
      questions.value.length = 0
    }
  } catch (error) {
    console.error('Ошибка при загрузке вопросов:', error)
    alert('Не удалось загрузить вопрос')
  } finally {
    nextQuestion()
    saveToCache()
  }
}

const hasSelection = (questionId) => {
  return selectedAnswers.value.some(a => a.questionId === questionId)

}

const selectOption = (questionId, option) => {
  // Удаляем предыдущий ответ если был
  selectedAnswers.value.forEach(item => {
    console.log(item)
  })
  console.log(questionId)
  selectedAnswers.value = selectedAnswers.value.filter(a => a.questionId !== questionId)
  selectedAnswers.value.forEach(item => {
    console.log(item)
  })

  // Добавляем новый ответ
  selectedAnswers.value.push({
    questionId,
    optionId: option.id,
    optionText: option.text,
    timestamp: new Date().toISOString()
  })

  fetchNextQuestion(option.id)
}

const fetchNextQuestion = async (questionId) => {
  await fetchQuestions(questionId)
}

const completeSurvey = async () => {
  const payload = {
    user: userData.value,
    answers: selectedAnswers.value.map(answer => ({
      questionId: answer.questionId,
      optionId: answer.optionId,
      timestamp: answer.timestamp
    })),
    completedAt: new Date().toISOString()
  }

  try {
    const response = await fetch('http://localhost:8080/saveAnswer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Ошибка сохранения ответов')

    const result = await response.json()
    console.log('Ответ сервера:', result)

  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось отправить ответы. Пожалуйста, попробуйте позже.')
  } finally {
    resetSurvey()
  }
}

const resetSurvey = () => {
  surveyStarted.value = false
  questions.value = []
  selectedAnswers.value = []
  questionHistory.value = []
  currentQuestionIndex.value = 0
  localStorage.removeItem('surveyAnswers')
}

const saveToCache = () => {
  localStorage.setItem('surveyData', JSON.stringify({
    userData: userData.value,
    questions: questions.value,
    answers: selectedAnswers.value
  }))
}

</script>

<style scoped>
.survey-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-data {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass);
  color: var(--text);
}

.questions-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.question-main {
  width: 100%;
  max-width: 800px;
  padding: 40px;
  margin: 0 auto;
}

.question-main h3 {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: var(--primary);
  text-align: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 30px 0;
}

.option-btn {
  padding: 15px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.option-btn:hover {
  background: rgba(110, 69, 226, 0.1);
}

.option-btn.selected {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(110, 69, 226, 0.3);
}

.question-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 8px 15px;
  font-size: 1rem;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  margin-top: 20px;
  padding: 12px 30px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(110, 69, 226, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 8px 15px;
  font-size: 1rem;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.completion-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  width: 100%;
}

.summary {
  margin: 30px 0;
  text-align: left;
  background: var(--glass);
  padding: 25px;
  border-radius: 10px;
}

.summary h3 {
  color: var(--accent);
  margin-bottom: 20px;
  text-align: center;
}

.summary ul {
  list-style-type: none;
  padding: 0;
}

.summary li {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--glass-border);
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-main {
    padding: 25px;
  }

  .user-data,
  .completion-screen {
    padding: 30px;
  }
}
</style>