import { MicroDBFacade } from '../facade';

describe('micro-db/DBFacade tests', () => {
	const allMethods = [
		'close',
		'create',
		'select',
		'selectWhere',
		'selectAllWhere',
		'selectAll',
		'update',
		'updateWhere',
		'updateAllWhere',
		'mutate',
		'mutateWhere',
		'mutateAllWhere',
		'mutateAll',
		'migrate',
		'delete',
		'deleteWhere',
		'deleteAllWhere',
		'flush',
		'data',
	];

	class FacadeImplementation extends MicroDBFacade<{ prop: number }> {
		public _data = this.data;
		public _close = this.close;
		public _create = this.create;
		public _select = this.select;
		public _selectWhere = this.selectWhere;
		public _selectAllWhere = this.selectAllWhere;
		public _selectAll = this.selectAll;
		public _update = this.update;
		public _updateWhere = this.updateWhere;
		public _updateAllWhere = this.updateAllWhere;
		public _mutate = this.mutate;
		public _mutateWhere = this.mutateWhere;
		public _mutateAllWhere = this.mutateAllWhere;
		public _mutateAll = this.mutateAll;
		public _migrate = this.migrate;
		public _delete = this.delete;
		public _deleteWhere = this.deleteWhere;
		public _deleteAllWhere = this.deleteAllWhere;
		public _flush = this.flush;
	}

	it('should forward all methods', () => {
		const facade = new FacadeImplementation();
		for (const method of allMethods) {
			// @ts-ignore
			expect(facade[method]).toBeDefined();
		}
	});

	it('should throw now error', () => {
		const facade = new FacadeImplementation({});

		for (const method of allMethods) {
			// @ts-ignore
			expect(facade['_' + method]).toBeDefined();
			expect(() => {
				// @ts-ignore
				facade['_' + method]();
			}).not.toThrow();
		}
	});
});
