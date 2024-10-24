import { ButtonStyles } from 'oceanic.js'

export interface BaseTemplate<Type extends string, DataType, Variables extends object = {}> {
    type: Type
    description?: string
    variables?: Partial<Record<keyof Variables, { description: string }>>
    val: (variables: Variables) => DataType
}

interface MessageDataType {
    content?: string;
    embeds?: Array<{
        color?: number;

        title?: string;
        description?: string;

        url?: string;

        author?: {
            name: string;
            url?: string;
            iconURL?: string;
        }

        fields?: Array<{
            inline?: boolean;
            name: string;
            value: string;
        }>

        thumbnail?: {
            url: string
            height?: number;
            width?: number;
        }

        image?: {
            url: string
            height?: number;
            width?: number;
        }
        
        footer?: {
            text: string
            iconURL?: string
        }

        timestamp?: string;
    }>
}

export interface MessageTemplate<Variables extends object = {}> extends BaseTemplate<'message', MessageDataType, Variables> {}

interface SelectMenuDataType {
    placeholder: string
    options: Array<{
        label: string
        value: string
        description?: string
        emoji?: {
            id: string
            name?: string
            animated?: boolean
        }
        default?: boolean
    }>
}

export interface SelectMenuTemplate<Variables extends object = {}, OptionVariables extends object = {}> extends BaseTemplate<'select-menu', SelectMenuDataType, Variables> {
    val: (variables: Variables, optionVariables: Array<OptionVariables & { value: string, default?: boolean }>) => SelectMenuDataType
}

export interface ButtonTemplate<Variables extends object = {}> extends BaseTemplate<'button', Variables> {
    val(variables: Variables): {
        label?: string
        emoji?: {
            id: string
            name?: string
            animated?: boolean
        }
        url?: string
        style: ButtonStyles
    },
}

export interface StringTemplate<Variables extends object = {}> extends BaseTemplate<'string', string, Variables> {}

export interface UserVariable {
    readonly id: string
    displayName: string
    username: string
    tag: string
    isBot: boolean
    discriminator: string
    toString(): string
}

export interface CommandVariables {
    Author: UserVariable
}