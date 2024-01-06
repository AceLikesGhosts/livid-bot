import type { ClientEvents } from 'discord.js';

type PossibleEvents = keyof ClientEvents;
type EventData<T extends keyof ClientEvents> = {
    on: T,
    listener: (...data: ClientEvents[T]) => unknown;
    enabled?: boolean;
};

export type Events<T extends PossibleEvents[] = PossibleEvents[]> = {
    [K in keyof T]: EventData<T[K]>
}