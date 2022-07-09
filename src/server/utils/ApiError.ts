class ApiError extends Error {
    public status?: number;

    constructor(message: string, status: number) {
        super(message);

        this.message = `${message}: ${status}`;
        this.status = status;

        delete this.stack;
    }
}

export default ApiError;