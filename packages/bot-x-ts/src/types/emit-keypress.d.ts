declare module 'emit-keypress' {
    interface KeypressOptions {
        input?: NodeJS.ReadStream
        onKeypress?: (input: string, key: KeyInfo, close: () => void) => void
    }

    interface KeyInfo {
        name?: string
        ctrl?: boolean
        meta?: boolean
        shift?: boolean
        sequence?: string
    }

    interface EmitKeypressResult {
        close: () => void
    }

    export function emitKeypress(options: KeypressOptions): EmitKeypressResult
}
