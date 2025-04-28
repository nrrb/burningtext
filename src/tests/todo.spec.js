import { setActivePinia, createPinia } from 'pinia'
import { useTodoStore } from '@/stores/todo'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('adds trimmed todo', () => {
  const store = useTodoStore()
  store.addTodo('  walk  ')
  expect(store.todos[0]).toEqual({ text: '  walk  ', done: false })
})

it('toggles status', () => {
  const store = useTodoStore()
  store.addTodo('task')
  store.toggleTodo(0)
  expect(store.todos[0].done).toBe(true)
})
