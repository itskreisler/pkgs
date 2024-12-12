// import { createStore as useStore } from 'zustand/vanilla'
import { useStore } from './jsonStorage.services'
export type CMDS = 'k' | 'lat' | 'flv'

interface GlobalState {
  groupDatabases: {
    [groupId: string]: {
      [command: string]: {
        data: Array<{ [key: string]: any }>
        notifications: boolean
      }
    }
  }
  getNotifications: (groupId: string, cmd: CMDS) => boolean // Obtiene el estado de las notificaciones.
  toggleNotifications: (groupId: string, cmd: CMDS, state: boolean) => void // Activa/Desactiva notificaciones.
  addCommandData: (groupId: string, cmd: CMDS, newData: { [key: string]: any }) => void // Agrega datos.
  getCommandData: (groupId: string, cmd: CMDS) => Array<{ [key: string]: any }> // Obtiene datos.
}
const GlobalDB = useStore<GlobalState>({
  nameStorage: 'tmpbot/globalDB',
  initialState: (set, get) => ({
    groupDatabases: {},
    getNotifications: (groupId: string, cmd: string) => {
      const group = get().groupDatabases[groupId] ?? {}
      return group[cmd]?.notifications ?? false
    },
    toggleNotifications: (groupId: string, cmd: string, active: boolean) => {
      set((state) => {
        const group = state.groupDatabases[groupId] ?? {}
        const commandData = group[cmd] ?? { data: [], notifications: false }
        commandData.notifications = active
        return {
          groupDatabases: {
            ...state.groupDatabases,
            [groupId]: { ...group, [cmd]: commandData }
          }
        }
      })
    },
    addCommandData: (groupId: string, cmd: string, newData: any) => {
      set((state) => {
        const group = state.groupDatabases[groupId] ?? {}
        const commandData = group[cmd] ?? { data: [], notifications: false }
        const temp = Array.from(
          new Map([...commandData.data, ...newData].map(obj => [obj.id, obj])).values()
        )
        commandData.data = temp
        return {
          groupDatabases: {
            ...state.groupDatabases,
            [groupId]: { ...group, [cmd]: commandData }
          }
        }
      })
    },
    getCommandData: (groupId: string, cmd: string) => {
      const group = get().groupDatabases[groupId] ?? {}
      return group[cmd]?.data ?? []
    }
  })
})
class CommandActions {
  private static instance: CommandActions // Instancia única
  private readonly cmdActions: Map<CMDS, { input: Function, output: Function }>

  private constructor() {
    this.cmdActions = new Map()
  }

  // Método para obtener la instancia única
  public static getInstance(): CommandActions {
    if (typeof CommandActions.instance === 'undefined') {
      CommandActions.instance = new CommandActions()
    }
    return CommandActions.instance
  }

  // Obtiene las acciones de un comando específico
  public getCmdActions(cmd: CMDS) {
    return this.cmdActions.get(cmd)
  }

  // Configura las acciones de un comando específico
  public setCmdActions(cmd: CMDS, input: Function, output: Function) {
    this.cmdActions.set(cmd, { input, output })
  }
}
// const { getState, setState, subscribe, getInitialState } = GlobalDB
const CmdActions = CommandActions.getInstance()
export { GlobalDB, CmdActions }
