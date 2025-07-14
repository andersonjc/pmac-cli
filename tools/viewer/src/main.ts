import './styles/app.css'
import App from './App.svelte'

const target = document.getElementById('app');

// Clear the target element first to replace loading content
target!.innerHTML = '';

const app = new App({
  target: target!,
})

export default app