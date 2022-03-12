import LunarClient from "./LunarClient";

class Event {
    public declare client: LunarClient;
    public event: string;

    constructor(
        client: LunarClient,
        event: string,
    ) {
        this.event = event;

        Object.defineProperty(this, "client", client);
    };
};

export default Event;