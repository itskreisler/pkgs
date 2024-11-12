import { createStore } from 'zustand/vanilla'

interface GroupDatabase {
  [groupId: string]: {
    [command: string]: {
      data: Map<string, { id: string }> // aquí guardas los datos temporales específicos
    }
  }
}
interface GlobalState {
  groupDatabases: Map<string, Map<string, Map<string, Map<string, { id: string }>>>>
  cmdAcctions: Map<'lat' | 'flv' | 'k', { input: Function, output: Function }>
  setCmdAcctions: (cmd: 'lat' | 'flv' | 'k', input: Function, output: Function) => void
}
const GlobalDB = createStore<GlobalState>((set, get) => ({
  groupDatabases: new Map(),
  cmdAcctions: new Map(),
  setCmdAcctions: (cmd: 'lat' | 'flv' | 'k', input: Function, output: Function) => {
    const cmdAcctions = get().cmdAcctions
    cmdAcctions.set(cmd, { input, output })
  }
}))
// const { getState, setState, subscribe, getInitialState } = GlobalDB

export { GlobalDB }
