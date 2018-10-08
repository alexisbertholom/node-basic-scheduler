"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
class Scheduler {
    constructor(action, getNextEvent, nextEvent = null) {
        this.action = action;
        this.getNextEvent = getNextEvent;
        this.nextEvent = nextEvent;
        this.refresh = async () => {
            try {
                this.nextEvent = await this.getNextEvent();
                this._schedule();
            }
            catch (e) {
                throw new Error('node-basic-scheduler: getNextEvent unhandled rejection: ' + e.toString());
            }
        };
        this._schedule = () => {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (!this.nextEvent) {
                this._timer = setTimeout(this.refresh, 0x7FFFFFFF);
                return;
            }
            const delay = this.nextEvent.timestamp - Date.now();
            if (delay <= 0)
                this._run();
            else if (delay >= 0x7FFFFFFF)
                this._timer = setTimeout(this._schedule, 0x7FFFFFFF);
            else
                this._timer = setTimeout(this._run, delay);
        };
        this._run = () => {
            this.action(this.nextEvent.payload);
            this.refresh();
        };
        if (nextEvent)
            this._schedule();
        else
            this.refresh();
    }
    scheduleIn(payload, delay) {
        const timestamp = Date.now() + delay;
        return this.schedule({ timestamp, payload });
    }
    schedule(event) {
        if (this.nextEvent && this.nextEvent.timestamp < event.timestamp)
            return;
        this.nextEvent = event;
        this._schedule();
    }
    get nextEventTimestamp() {
        return this.nextEvent && this.nextEvent.timestamp;
    }
}
exports.Scheduler = Scheduler;
;
exports.default = Scheduler;
//# sourceMappingURL=index.js.map