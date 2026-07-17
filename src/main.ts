import { createApp } from 'vue'
import App from './App.vue'
import pinia from './plugins/pinia'
import router from './router'
import '@/assets/styles/global.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
