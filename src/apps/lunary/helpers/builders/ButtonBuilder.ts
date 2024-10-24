import { ButtonStyles, ComponentTypes, PartialEmoji, ButtonComponent } from 'oceanic.js'

import { Optional } from '@/@types'

import { BaseComponentBuilder } from './ComponentBuilder'

interface RawButtonComponent {
    type: ComponentTypes.BUTTON
    style: ButtonStyles
    label: string | null 
    emoji: Optional<PartialEmoji, 'name'> | null
    custom_id: string | null
    url: string | null
    disabled: boolean | null
}

interface RawTextButton extends Omit<RawButtonComponent, 'style' | 'url' | 'custom_id'> {
    style: ButtonStyles.DANGER | ButtonStyles.PRIMARY | ButtonStyles.SECONDARY | ButtonStyles.SUCCESS
    custom_id: string
}

interface RawURLButton extends Omit<RawButtonComponent, 'style' | 'custom_id' | 'url'> {
    style: ButtonStyles.LINK
    url: string
}

export class ButtonBuilder extends BaseComponentBuilder<RawButtonComponent> {
	constructor(data?: Partial<RawTextButton | RawURLButton>) {
		super({ type: ComponentTypes.BUTTON, ...data })
	}

	setCustomId(customId: string) {
		this.data.custom_id = customId
		return this
	}

	setDisabled(disabled = true) {
		this.data.disabled = disabled
		return this
	}

	setEmoji(emoji: Optional<PartialEmoji, 'name'>) {
		this.data.emoji = emoji
		return this
	}

	setLabel(label: string) {
		this.data.label = label
		return this
	}

	setStyle(style: ButtonStyles) {
		this.data.style = ButtonBuilder.resolveStyle(style)
		return this
	}

	setURL(url: string) {
		this.data.url = url
		return this
	}

	toJSON() {
		const { disabled, custom_id: customID, emoji, label, style, type, url } = this.data

		return {
			disabled, 
			customID, 
			emoji, 
			label, 
			style,
			type, 
			url,
		} as ButtonComponent
	}
    
	static resolveStyle(style: ButtonStyles) {
		return typeof style === 'number' ? style as number : ButtonStyles[style] as any as number
	}
}