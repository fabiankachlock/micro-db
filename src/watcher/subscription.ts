export class Subscription {
	constructor(readonly id: string, public destroy: () => void) {}

	onClose = () => {};
}
