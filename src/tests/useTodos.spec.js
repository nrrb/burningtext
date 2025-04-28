import { setActivePinia, createPinia } from 'pinia'
import { useTodos } from '@/composables/useTodos'

it('total matches length and clears input', () => {
  setActivePinia(createPinia())
  const { add, total, newTodo } = useTodos()
  newTodo.value = 'buy milk'
  add()
  expect(total.value).toBe(1)
  expect(newTodo.value).toBe('')
})
