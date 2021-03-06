import { EventEmitter2 as EventEmitter } from "eventemitter2";

export default class EventSystem {

    private static EMITTER: EventEmitter = new EventEmitter();

    private static MAX_BUCKET_SIZE: number = 100;

    private static events: {[index: string]: any[][]} = {};

    public static fireEvent(eventName: string, ...args: any[]): void {
        this.storeEvent(eventName, ...args);
        this.EMITTER.emit(eventName, ...args);
    }

    public static registerEventListener(eventName: string, handler: Function,
                                        options: EventListenerOptions = { replay: true, once: false }): void {

        let safeHandler: Function = this.callSafety(handler);

        if (options.once) {
            this.EMITTER.once(eventName, safeHandler);
        } else {
            this.EMITTER.on(eventName, safeHandler);
        }

        if (options.replay) {
            this.replayEvents(eventName, safeHandler);
        }
    }

    private static storeEvent(eventName: string, ...args: any[]): void {
        let events: any[][] = this.events[eventName];

        if (!events) {
            events = [];
            this.events[eventName] = events;
        }

        // limit size of each bucket to prevent problems
        if (events.length >= this.MAX_BUCKET_SIZE) {
            events.shift();
        }

        events.push(args);
    }

    private static replayEvents(eventName: string, handler: Function): void {
        const events: any[][] = this.events[eventName];
        if (!events) {
            return;
        }
        events.forEach((args: any) => handler(...args));
    }

    private static callSafety(handler: Function): Function {
        return (...args: any[]) => {
            try {
                handler.apply(this, args);
            } catch (e) {
                if ( console && console.error ) {
                    console.error("error on executing handler:" + handler, e);
                }
            }
        };
    }

}

export interface EventListenerOptions {

    replay?: boolean;
    once?: boolean;

}
