import { MicroDBBase } from '../db';
import { MicroDBDriver } from '../driver';

export class MicroDBRef<T> {
	readonly base: MicroDBBase;
	readonly driver: MicroDBDriver<T>;

	constructor(base: MicroDBBase | MicroDBDriver<T>) {
		if ('_dbRef' in base) {
			this.driver = base;
			this.base = base._dbRef;
		} else {
			this.base = base;
			this.driver = MicroDBDriver.forDatabase(base);
		}
	}
}
