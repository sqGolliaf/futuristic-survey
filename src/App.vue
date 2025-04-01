<template>
  <ParticlesBackground />
  <div class="survey-container">
    <div class="survey-header">
      <h1 class="survey-title">
        <span class="title-gradient">ОПРОСНИК</span>
        <span class="title-year">{{ new Date().getFullYear() }}</span>
      </h1>
      <p class="survey-description">Помогите нам стать лучше — ответьте на несколько вопросов</p>
      <ThemeToggle />
    </div>

    <SurveyForm />
  </div>
</template>

<script setup>
import ParticlesBackground from './components/ParticlesBackground.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import SurveyForm from './components/SurveyForm.vue'
</script>

<style scoped>
.survey-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.survey-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  width: 100%;
}

.survey-title {
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-gradient {
  background: linear-gradient(90deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.title-year {
  font-size: 0.6em;
  background: var(--glass);
  backdrop-filter: blur(10px);
  padding: 5px 15px;
  border-radius: 50px;
  border: 1px solid var(--glass-border);
  margin-top: 10px;
  font-weight: 600;
  color: var(--accent);
}

.survey-description {
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto 20px;
}
</style>