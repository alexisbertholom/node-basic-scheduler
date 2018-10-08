interface EventData<T> {
    timestamp: number;
    payload: T;
}
declare type ActionF<T> = (payload: T) => any;
declare type EventGetterF<T> = () => Promise<EventData<T> | null>;
export declare class Scheduler<PayloadT> {
    private action;
    private getNextEvent;
    private nextEvent;
    private _timer;
    constructor(action: ActionF<PayloadT>, getNextEvent: EventGetterF<PayloadT>, nextEvent?: EventData<PayloadT> | null);
    refresh: () => Promise<void>;
    scheduleIn(payload: PayloadT, delay: number): void;
    schedule(event: EventData<PayloadT>): void;
    readonly nextEventTimestamp: number | null;
    private _schedule;
    private _run;
}
export default Scheduler;
