// eventBus.js
import { reactive } from 'vue'

const eventBus = reactive({
  events: new Map(),

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(listener)
  },

  off(event, listenerToRemove) {
    if (!this.events.has(event)) return

    const listeners = this.events.get(event)
    this.events.set(
      event,
      listeners.filter((listener) => listener !== listenerToRemove)
    )
  },

  emit(event, payload) {
    if (!this.events.has(event)) return

    this.events.get(event).forEach((listener) => listener(payload))
  }
})

export default eventBus
