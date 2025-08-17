import { describe, it, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import { jsonStorage } from '../src/lib/zustand/jsonStorage.services'
import { usePersist } from '../src/lib/zustand/zustandWrapper'

const COUNTER_FILE = './test-counter.json'
const USER_FILE = './test-user.json'

/**
 * Test suite para el hook usePersist que proporciona persistencia automática
 * para stores de Zustand usando almacenamiento híbrido.
 */
describe('usePersist', () => {
    beforeEach(() => {
        // Limpiar archivos de test antes de cada prueba
        if (fs.existsSync(COUNTER_FILE)) fs.unlinkSync(COUNTER_FILE)
        if (fs.existsSync(USER_FILE)) fs.unlinkSync(USER_FILE)
    })

    after(() => {
        // Limpiar archivos de test después de todas las pruebas
        if (fs.existsSync(COUNTER_FILE)) fs.unlinkSync(COUNTER_FILE)
        if (fs.existsSync(USER_FILE)) fs.unlinkSync(USER_FILE)
    })

    it('should create a working store with initial state', (_t, done) => {
        interface CounterState {
            count: number
            increment: () => void
            decrement: () => void
            reset: () => void
        }

        const useCounterStore = usePersist<CounterState>({
            nameStorage: 'test-counter',
            initialState: (set) => ({
                count: 0,
                increment: () => set((state: CounterState) => ({ count: state.count + 1 })),
                decrement: () => set((state: CounterState) => ({ count: state.count - 1 })),
                reset: () => set({ count: 0 })
            })
        })

        // Test del estado inicial
        assert.strictEqual(useCounterStore.getState().count, 0)

        // Test de las acciones
        useCounterStore.getState().increment()
        assert.strictEqual(useCounterStore.getState().count, 1)

        useCounterStore.getState().increment()
        assert.strictEqual(useCounterStore.getState().count, 2)

        useCounterStore.getState().decrement()
        assert.strictEqual(useCounterStore.getState().count, 1)

        useCounterStore.getState().reset()
        assert.strictEqual(useCounterStore.getState().count, 0)

        done()
    })

    it('should persist state to storage file', (_t, done) => {
        const useUserStore = usePersist<{
            id: number;
            name: string;
            email: string;
            setUser: (user: { id: number; name: string; email: string }) => void
        }>({
            nameStorage: 'test-user',
            initialState: (set) => ({
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                setUser: (user) => set(user)
            })
        })

        // Cambiar el estado
        useUserStore.getState().setUser({
            id: 2,
            name: 'Jane Doe',
            email: 'jane@example.com'
        })

        // Verificar que el estado se actualizó en memoria
        const currentState = useUserStore.getState()
        assert.strictEqual(currentState.id, 2)
        assert.strictEqual(currentState.name, 'Jane Doe')
        assert.strictEqual(currentState.email, 'jane@example.com')

        // Esperar a que la persistencia ocurra (debounce + escritura)
        setTimeout(() => {
            try {
                // Verificar que el archivo fue creado
                const storageFile = 'test-user.json'
                assert(fs.existsSync(storageFile), 'Storage file should exist')

                done()
            } catch (error) {
                done(error)
            }
        }, 1500) // Esperar suficiente tiempo para debounce + persistencia
    })

    it('should handle complex state objects', (_t, done) => {
        interface TodoState {
            todos: { id: number; text: string; completed: boolean }[]
            addTodo: (text: string) => void
            toggleTodo: (id: number) => void
            removeTodo: (id: number) => void
        }

        const useTodoStore = usePersist<TodoState>({
            nameStorage: 'test-todos',
            initialState: (set) => ({
                todos: [],
                addTodo: (text) => set((state: TodoState) => ({
                    todos: [...state.todos, {
                        id: Date.now(),
                        text,
                        completed: false
                    }]
                })),
                toggleTodo: (id) => set((state: TodoState) => ({
                    todos: state.todos.map(todo =>
                        todo.id === id ? { ...todo, completed: !todo.completed } : todo
                    )
                })),
                removeTodo: (id) => set((state: TodoState) => ({
                    todos: state.todos.filter(todo => todo.id !== id)
                }))
            })
        })

        // Test de operaciones complejas
        useTodoStore.getState().addTodo('Learn TypeScript')
        useTodoStore.getState().addTodo('Write tests')

        assert.strictEqual(useTodoStore.getState().todos.length, 2)
        assert.strictEqual(useTodoStore.getState().todos[0].text, 'Learn TypeScript')
        assert.strictEqual(useTodoStore.getState().todos[0].completed, false)

        // Toggle completado
        const firstTodoId = useTodoStore.getState().todos[0].id
        useTodoStore.getState().toggleTodo(firstTodoId)
        assert.strictEqual(useTodoStore.getState().todos[0].completed, true)

        // Remover todo
        useTodoStore.getState().removeTodo(firstTodoId)
        assert.strictEqual(useTodoStore.getState().todos.length, 1)
        assert.strictEqual(useTodoStore.getState().todos[0].text, 'Write tests')

        done()
    })
})

/**
 * Test suite para la función jsonStorage que proporciona almacenamiento persistente
 * con soporte para compresión y debouncing.
 */
describe('jsonStorage', () => {
    const STORAGE_FILE = './test-json-storage.json'

    beforeEach(() => {
        if (fs.existsSync(STORAGE_FILE)) fs.unlinkSync(STORAGE_FILE)
    })

    after(() => {
        if (fs.existsSync(STORAGE_FILE)) fs.unlinkSync(STORAGE_FILE)
    })

    it('should create storage file with initial empty state', () => {
        jsonStorage(STORAGE_FILE, { debounceMs: 0 })
        assert(fs.existsSync(STORAGE_FILE), 'Storage file should be created')

        const content = fs.readFileSync(STORAGE_FILE, 'utf-8')
        assert.strictEqual(content, '{}', 'Initial content should be empty object')
    })

    it('should store and retrieve items', () => {
        const storage = jsonStorage(STORAGE_FILE, { debounceMs: 0, useCompression: false })

        storage.setItem('test-key', 'test-value')
        const retrieved = storage.getItem('test-key')

        assert.strictEqual(retrieved, 'test-value')
    })

    it('should handle TTL functionality', (_t, done) => {
        const storage = jsonStorage(STORAGE_FILE, { debounceMs: 0 })

        // Usar setItemWithTTL si está disponible
        if (storage.setItemWithTTL) {
            storage.setItemWithTTL('expiring-key', 'expiring-value', 1) // 1 segundo TTL

            // Verificar que existe inmediatamente
            assert.strictEqual(storage.getItem('expiring-key'), 'expiring-value')

            // Verificar que expira después del TTL
            setTimeout(() => {
                const expired = storage.getItem('expiring-key')
                assert.strictEqual(expired, null, 'Item should be expired and return null')
                done()
            }, 1100) // Esperar más que el TTL
        } else {
            done()
        }
    })
})
