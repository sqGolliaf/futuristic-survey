import { createApp } from 'vue'
import App from './App.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)

// Инициализация AOS
app.AOS = AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
})

app.mount('#app')