class UserInventory {
	public owned: number[];
	public using: { layout: number, background: number };

	constructor(owned: number[], using: { layout: number, background: number } = {} as any) {
		this.owned = owned.length ? owned : [0, 1];
			
		this.using = { background: using.background ?? 0, layout: using.layout ?? 1 };
	}
}

export { UserInventory };