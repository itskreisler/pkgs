import { createStore } from 'zustand/vanilla'

interface GroupDatabase {
  [groupId: string]: {
    [command: string]: {
      data: Map<string, { id: string }> // aquí guardas los datos temporales específicos

    }
  }
}

interface GlobalState {
  groupDatabases: GroupDatabase
}
const temp = new Map<string, { id: string }>()
temp.set('id', { id: '123' })
temp.set('232', { id: '123' })
const GlobalDB = createStore<GlobalState>((set, get) => ({
  groupDatabases: {
    idgrupo: {
      lat: {
        data: temp
      }
    }
  }

}))
// const { getState, setState, subscribe, getInitialState } = GlobalDB

export { GlobalDB }
