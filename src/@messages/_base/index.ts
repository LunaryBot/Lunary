import * as Messages from './general'

export type MessageKitMap = {
    [key in keyof typeof Messages]: ((...placeholders: Parameters<typeof Messages[key]['val']>) => ReturnType<typeof Messages[key]['val']>) | ReturnType<typeof Messages[key]['val']>
}

export * from './general'