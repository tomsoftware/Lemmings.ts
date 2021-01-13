export class EventHandler<T> {
    private handlers: { (arg?: T): void; }[] = [];

    public on(handler: { (arg?: T): void }) : void {
        this.handlers.push(handler);
    }

    public off(handler: { (arg?: T): void }) : void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    /// clear all callbacks
    public dispose() : void {
        this.handlers = [];
    }

    /// raise all 
    public trigger(arg?: T) {
        this.handlers.slice(0).forEach(h => h(arg));
    }
}
