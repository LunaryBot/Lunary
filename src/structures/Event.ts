import LunarClient from "./LunarClient";

class Event {
    public declare client: LunarClient;
    public event: string;
    public run?(...args: any[]): void;

    constructor(
        event: string,
        client: LunarClient,
    ) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false });
        
        this.event = event;
    };
};

export default Event;

export { LunarClient };