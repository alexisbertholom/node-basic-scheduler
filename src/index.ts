interface EventData<T>
{
  timestamp: number,
  payload: T,
};

type ActionF<T> = (payload: T) => any;
type EventGetterF<T> = () => Promise<EventData<T> | null>;

export class Scheduler<PayloadT>
{
  private _timer: NodeJS.Timer | null;

  constructor(
    private action: ActionF<PayloadT>,
    private getNextEvent: EventGetterF<PayloadT>,
    private nextEvent: EventData<PayloadT> | null = null,
  )
  {
    if (nextEvent)
      this._schedule();
    else
      this.refresh();
  }

  public refresh = async () =>
  {
    try
    {
      this.nextEvent = await this.getNextEvent();
      this._schedule();
    }
    catch (e)
    {
      throw new Error('node-basic-scheduler: getNextEvent unhandled rejection: ' + e.toString());
    }
  }

  public scheduleIn(payload: PayloadT, delay: number)
  {
    const timestamp = Date.now() + delay;
    return this.schedule({ timestamp, payload });
  }

  public schedule(event: EventData<PayloadT>)
  {
    if (this.nextEvent && this.nextEvent.timestamp < event.timestamp)
      return;
    this.nextEvent = event;
    this._schedule();
  }

  public get nextEventTimestamp(): number | null
  {
    return this.nextEvent && this.nextEvent.timestamp;
  }

  private _schedule = () =>
  {
    if (this._timer)
    {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (!this.nextEvent)
    {
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
  }

  private _run = () =>
  {
    this.action(this.nextEvent!.payload);
    this.refresh();
  }
};

export default Scheduler;
