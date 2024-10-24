export type Optional<O, K extends keyof O> = Omit<O, K> & Partial<Pick<O, K>>

export type ConditionalType<Value extends boolean, TrueResult, FalseResult = null> = Value extends true
        ? TrueResult
        : FalseResult

export type OmitDeep<T, K extends keyof any> = T extends object
        ? T extends Array<infer U>
          ? Array<OmitDeep<U, K>>
          : {
              [P in keyof T as P extends K ? never : P]: OmitDeep<T[P], K>
            }
        : T

type ArrayShift<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;
