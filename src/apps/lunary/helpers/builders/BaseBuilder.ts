export class BaseBuilder<DataType extends object> {
	data: DataType

	constructor(data: Partial<DataType>) {
		this.data = data as DataType
	}
}