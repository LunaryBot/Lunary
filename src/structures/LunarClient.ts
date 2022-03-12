import { Client, ClientOptions } from "eris";

class LunarClient extends Client {
    constructor(
        token: string, 
        options: ClientOptions
    ) {
        super(token, options);
    }
}

export default LunarClient;