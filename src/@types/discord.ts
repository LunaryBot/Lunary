import type {
	APIApplicationCommandAutocompleteInteraction,
	APIApplicationCommandAutocompleteResponse,
	APIApplicationCommandInteraction,
	APIChatInputApplicationCommandInteractionDataResolved,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseDeferredChannelMessageWithSource,
	APIInteractionResponseDeferredMessageUpdate,
	APIInteractionResponseUpdateMessage,
	APIMessageApplicationCommandInteractionDataResolved,
	APIMessageComponentInteraction,
	APIModalInteractionResponse,
	APIModalSubmitInteraction,
	APIUserApplicationCommandInteractionDataResolved,
	APIWebhook,
	APIGuildMember,
	APIInteractionDataResolvedGuildMember,
	Routes,
} from 'discord-api-types/v10';
  
export * from 'discord-api-types/v10';
  
export type APIFetchedGuildMember = APIGuildMember &
	Required<Pick<APIGuildMember, 'user'>>;

export type Snowflake = `${bigint}`; // discord-api-types snowflake sucks

export type Route = ReturnType<typeof Routes[keyof typeof Routes]>;
  
export type APIFullOrInteractionGuildMember =
	| APIGuildMember
	| APIInteractionDataResolvedGuildMember;
  
/**
* Represents the possible command acknowledgement types.
* @enum {number}
*/
export enum CommandAcknowledgementType {
	/**
	 * This acknowledgement mode does nothing. You must acknowledge interactions
	 * yourself using Interaction#acknowledge if you are doing a long task, else
	 * the interaction token will expire after 3 seconds and the interaction will
	 * fail.
	 *
	 * NOTE: this mode must be used in order to send modals as Discord does not
	 * currently support deferring them.
	 */
	Manual = -1,
  
	/**
	 * This acknowledgement mode will wait ~1500ms for you to return a response.
	 * If a response is given, the interaction is responded to straight away,
	 * without having to deal with acknowledgements or anything. However, if the
	 * interaction exceeds the deadline, it will be automatically acknowledged.
	 *
	 * The Interaction#respond function will always work, even if the interaction
	 * was automatically acknowledged (in this case it will edit original).
	 *
	 * Note that the acknowledgement sent is non-ephemeral, meaning that attempts
	 * to send an ephemeral message will throw if sent with a non-ephemeral
	 * acknowledgement.
	 */
	Auto,
  
	/**
	 * This acknowledgement mode is the same as CommandAcknowledgementType.Auto,
	 * but it acknowledges the interaction in an ephemeral way. This means that
	 * Interaction#respond will function the same as Interaction#respondEphemeral
	 * and Interaction#editOriginal won't work at all.
	 */
	AutoEphemeral,
  
	/**
	 * This acknowledgement mode is the same as CommandAcknowledgementType.Auto
	 * and CommandAcknowledgementType.AutoEphemeral, but it will acknowledge the
	 * interaction in an ephemeral way *only if it was not sent in DMs*.
	 */
	EphemeralIfNotPrivate,
  }
  
export enum ComponentAcknowledgementType {
	/**
	 * This acknowledgement mode does nothing. You must acknowledge interactions
	 * yourself using Interaction#acknowledge if you are doing a long task, else
	 * the interaction token will expire after 3 seconds and the interaction will
	 * fail.
	 *
	 * NOTE: this mode must be used in order to send modals as Discord does not
	 * currently support deferring them.
	 */
	Manual = -1,
  
	/**
	 * This acknowledgement mode will wait ~1500ms for you to return a response.
	 * If a response is given, the interaction is responded to straight away,
	 * without having to deal with acknowledgements or anything. However, if the
	 * interaction exceeds the deadline, it will be automatically acknowledged.
	 *
	 * The Interaction#respond function will always work, even if the interaction
	 * was automatically acknowledged (in this case it will edit original).
	 *
	 * Note that the acknowledgement sent is non-ephemeral, meaning that attempts
	 * to send an ephemeral message will throw if sent with a non-ephemeral
	 * acknowledgement.
	 */
	Auto,
  
	/**
	 * This acknowledgement mode is the same as ComponentAcknowledgementType.Auto,
	 * but it acknowledges the interaction in an ephemeral way. This means that
	 * Interaction#respond will function the same as Interaction#respondEphemeral
	 * and Interaction#editOriginal won't work at all.
	 */
	AutoEphemeral,
  
	/**
	 * This acknowledgement mode is the same as ComponentAcknowledgementType.Auto
	 * and ComponentAcknowledgementType.AutoEphemeral, but it will acknowledge the
	 * interaction in an ephemeral way *only if it was not sent in DMs*.
	 */
	EphemeralIfNotPrivate,
  
	/**
	 * This acknowledgement mode is like the Auto type, but instead of creating a
	 * followup message, it edits the message that the component is attached to.
	 * Note that the user does not see a loading state, unlike the other types.
	 *
	 * Upon editing, the original contents of the message are lost.
	 */
	Edit,
  }
  
/** Represents a valid interaction response for an application command. */
export type ApplicationCommandInteractionResponse =
	| APIInteractionResponseChannelMessageWithSource
	| APIInteractionResponseDeferredChannelMessageWithSource
	| APIModalInteractionResponse;
  
/** Represents a valid interaction response for a message component. */
export type MessageComponentInteractionResponse =
	| ApplicationCommandInteractionResponse
	| APIInteractionResponseDeferredMessageUpdate
	| APIInteractionResponseUpdateMessage;
  
/** Represents a valid interaction response for a modal. */
export type ModalInteractionResponse =
	| APIInteractionResponseChannelMessageWithSource
	| APIInteractionResponseDeferredChannelMessageWithSource;
  
/** Represents a valid response for any user-initiated interaction */
export type UserInitiatedInteractionResponse =
	| APIApplicationCommandAutocompleteResponse
	| ApplicationCommandInteractionResponse
	| MessageComponentInteractionResponse
	| ModalInteractionResponse;
  
/** Represents any interaction that a user initiated (i.e. anything but ping) */
export type APIUserInitiatedInteraction =
	| APIApplicationCommandInteraction
	| APIApplicationCommandAutocompleteInteraction
	| APIMessageComponentInteraction
	| APIModalSubmitInteraction;
  
/** Represents application command resolved data */
export type APIInteractionDataResolved =
	| APIChatInputApplicationCommandInteractionDataResolved
	| APIUserApplicationCommandInteractionDataResolved
	| APIMessageApplicationCommandInteractionDataResolved;
  
/** Represents a webhook for internal interaction use only. */
export type APIInteractionWebhook = Partial<APIWebhook> &
	Pick<APIWebhook, 'id'> &
	Pick<APIWebhook, 'type'>;

export type OAuth2Scopes = 
	'applications.builds.read' 
	| 'applications.commands'
	| 'applications.entitlements' 
	| 'applications.store.update' 
	| 'bot' 
	| 'connections' 
	| 'email' 
	| 'identify' 
	| 'guilds' 
	| 'guilds.join' 
	| 'gdm.join' 
	| 'webhook.incoming';