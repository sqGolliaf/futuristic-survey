<template>
  <form v-if="!submitted" class="glass-panel">
    <div class="form-section" data-aos="fade-up">
      <div class="form-group floating-input">
        <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder=" "
        >
        <label for="name">Ваше имя</label>
        <span class="input-border"></span>
      </div>

      <div class="form-group floating-input">
        <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder=" "
        >
        <label for="email">Ваш email</label>
        <span class="input-border"></span>
      </div>
    </div>

    <div class="form-actions" data-aos="fade-up" data-aos-delay="250">
      <button type="submit" class="submit-btn" :disabled="!formData.name || !formData.email || isLoading">
        <span class="btn-text" @click="handleSubmit">
          {{ isLoading ? 'Отправка...' : 'Отправить' }}
        </span>
        <span class="btn-icon">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </span>
        <span class="btn-glow"></span>
      </button>
    </div>
  </form>

  <div v-else class="success-message glass-panel">
    <div class="success-animation">
<!--      <svg class="checkmark" viewBox="0 0 52 52">-->
<!--        <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>-->
<!--        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>-->
<!--      </svg>-->
      <h3>Выберите:</h3>
      <div class="btn-lst" v-for="el in cache">
        <button
            v-if="cache"
            class="response-btn"
            @click="handleResponseButtonClick(el.value.id)"
        >
          {{ el.value.text }}
        </button>
      </div>

      <button class="response-btn" @click="resetForm">Заполнить еще раз</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: ''
})

const dataOnt = ref({
  id: 0,
  text: '',
  storage: {}
})
const cache = ref([dataOnt])
const reps = ref([dataOnt])

const submitted = ref(false)
const isLoading = ref(false)
const isUpdate = ref(false)

const handleSubmit = async () => {
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:8080/')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0 && data[0].text) {
      data.forEach((el) => {
        dataOnt.value.id = el.id
        dataOnt.value.text = el.text
        dataOnt.value.storage = el.storage
        console.log(el)

        cache.value.push(dataOnt)
      })

      console.log(cache)
    }

    submitted.value = true
  } catch (error) {
    console.error('Ошибка при отправке формы:', error)
  } finally {
    isLoading.value = false
  }
}

const handleResponseButtonClick = async (url) => {
  isUpdate.value = false
  try {
    const response = await fetch('http://localhost:8080/' + url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (Array.isArray(data) && data.length > 0 && data[0].text) {
      data.forEach((el) => {
        dataOnt.value.id = el.id
        dataOnt.value.text = el.text
        dataOnt.value.storage = el.storage


        cache.value.push(dataOnt)
      })

      console.log(cache)
    }
  } catch (error) {
    console.error('Ошибка при отправке формы:', error)
  } finally {
    isUpdate.value = true
  }
}

const resetForm = () => {
  formData.value = { name: '', email: '' }
  submitted.value = false
  cache.value = []
}
</script>

<style scoped>
.form-section {
  margin-bottom: 30px;
  position: relative;
}

.form-group {
  margin-bottom: 25px;
  position: relative;
}

.floating-input {
  position: relative;
}

.floating-input input,
.floating-input textarea {
  width: 100%;
  padding: 15px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  font-size: 1rem;
  color: var(--text);
  transition: all 0.3s ease;
}

.floating-input textarea {
  min-height: 120px;
  resize: vertical;
}

.floating-input label {
  position: absolute;
  top: 15px;
  left: 15px;
  color: var(--text);
  opacity: 0.7;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  transform-origin: left center;
}

.floating-input input:focus,
.floating-input textarea:focus,
.floating-input input:not(:placeholder-shown),
.floating-input textarea:not(:placeholder-shown) {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(110, 69, 226, 0.2);
}

.floating-input input:focus ~ label,
.floating-input textarea:focus ~ label,
.floating-input input:not(:placeholder-shown) ~ label,
.floating-input textarea:not(:placeholder-shown) ~ label {
  transform: translateY(-25px) scale(0.85);
  opacity: 1;
  color: var(--primary);
  background: var(--bg);
  padding: 0 5px;
  border-radius: 5px;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, var(--primary), var(--secondary));
  transition: width 0.4s ease;
}

.floating-input input:focus ~ .input-border,
.floating-input textarea:focus ~ .input-border {
  width: 100%;
}

.form-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.submit-btn {
  position: relative;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 5px 15px rgba(110, 69, 226, 0.3);
  z-index: 1;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(110, 69, 226, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
  fill: white;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover .btn-glow {
  opacity: 1;
}

.success-message {
  text-align: center;
  padding: 40px;
}

.success-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.checkmark {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.checkmark-circle {
  stroke: var(--success);
  stroke-width: 2;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  stroke: var(--success);
  stroke-width: 2;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

.response-btn {
  margin-top: 20px;
  padding: 10px 25px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(110, 69, 226, 0.3);
}

.response-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(110, 69, 226, 0.4);
}

.response-btn:active {
  transform: translateY(0);
}
</style>