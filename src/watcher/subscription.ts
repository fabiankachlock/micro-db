export class MicroDBSubscription {
	constructor(readonly id: string, public destroy: () => void) {}

	onClose = () => {};
}
