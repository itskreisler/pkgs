import { createStore } from 'zustand/vanilla'

export type CMDS = 'k' | 'lat' | 'flv'
interface TOptions { from: string, cmd: CMDS }
interface GroupDatabase {
  [groupId: string]: {
    [command: string]: {
      data: Map<string, { id: string }> // aquí guardas los datos temporales específicos
      notifications: boolean
    }
  }
}
interface GlobalState {
  groupDatabases: GroupDatabase
  cmdAcctions: Map<CMDS, { input: Function, output: Function }>
  setCmdAcctions: (cmd: CMDS, input: Function, output: Function) => void
  getCmdAcctions: (cmd: CMDS) => { input: Function, output: Function } | undefined
  startDbGroup: (options: TOptions) => void
  getNotification: (options: TOptions) => boolean
  setNotification: (options: { active: boolean } & TOptions) => void
  setData: (options: { from: string, cmd: CMDS, data: Array<{ id: string }> }) => void
}
const GlobalDB = createStore<GlobalState>((set, get) => ({
  groupDatabases: {},
  cmdAcctions: new Map(),
  getCmdAcctions: (cmd: CMDS) => {
    return get().cmdAcctions.get(cmd)
  },
  setCmdAcctions: (cmd: CMDS, input: Function, output: Function) => {
    const cmdAcctions = get().cmdAcctions
    cmdAcctions.set(cmd, { input, output })
  },
  startDbGroup: ({ from, cmd }: TOptions) => {
    if (typeof get().groupDatabases[from] === 'undefined') set(({ groupDatabases: { [from]: {} } }))
    if (typeof get().groupDatabases[from][cmd] === 'undefined') {
      set(({
        groupDatabases: {
          [from]: {
            [cmd]: {
              data: new Map(),
              notifications: false
            }
          }
        }
      }))
    }
  },
  getNotification: ({ from, cmd }: TOptions) => {
    return get().groupDatabases[from][cmd].notifications
  },
  setNotification: ({ from, cmd, active }: { active: boolean } & TOptions) => {
    set(({
      groupDatabases: {
        [from]: {
          [cmd]: {
            ...GlobalDB.getState().groupDatabases[from][cmd],
            notifications: active
          }
        }
      }
    }))
  },
  setData: ({
    from,
    cmd,
    data
  }: { data: Array<{ id: string }> } & TOptions) => {
    for (const item of data) {
      get().groupDatabases[from][cmd]?.data?.set(item.id, item)
    }
  }
}))
// const { getState, setState, subscribe, getInitialState } = GlobalDB

export { GlobalDB }
