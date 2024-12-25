// import { createStore as useStore } from 'zustand/vanilla'
import { useStore } from './jsonStorage.services'
interface IGlobalState {
  [key: string]: any
}
export const GlobalState = useStore<IGlobalState>({
  nameStorage: 'tmpbot/globalDB',
  initialState: (set, get) => ({
    db: {},
    setDb (key: string, value: any) {
      set((state) => {
        state.db[key] = value
        return state
      })
    }
  })
})
