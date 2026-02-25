import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { usePolishStore } from './stores/polishStore';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia).mount('#app');

// Init store AFTER mount — chrome.storage is ready at this point
usePolishStore().init();
