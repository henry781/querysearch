import * as chai from 'chai';
import * as sinon from 'sinon';
import {QuerySearch} from './QuerySearch';

describe('QuerySearch', () => {

    const sandbox = sinon.createSandbox();

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * fromQueryParams
     */
    describe('fromQueryParams', () => {

        it('should return empty query search', () => {

            const queryParams = {};

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.sort).deep.equal({});
            chai.expect(search.filter).deep.equal({});
        });

        it('should return filter', () => {

            const queryParams = {
                filter: 'name[eq]=10',
            };

            sandbox.stub(QuerySearch, 'parseFilter')
                .withArgs({}, 'name[eq]=10')
                .returns({
                    name: {$eq: '10'},
                });

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.filter).deep.equal({
                name: {$eq: '10'},
            });
        });

        it('should return filter (regex)', () => {

            const queryParams = {
                filter: 'name[regex]=/^monitoring/i',
            };

            sandbox.stub(QuerySearch, 'parseFilter')
                .withArgs({}, 'name[regex]=/^monitoring/i')
                .returns({
                    name: {$regex: /^monitoring/i},
                });

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.filter).deep.equal({
                name: {$regex: /^monitoring/i},
            });
        });

        it('should return filter (array)', () => {

            const queryParams = {
                filter: ['name[eq]=10'],
            };

            sandbox.stub(QuerySearch, 'parseFilter')
                .withArgs({}, 'name[eq]=10')
                .returns({
                    name: {$eq: '10'},
                });

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.filter).deep.equal({
                name: {$eq: '10'},
            });
        });

        it('should return sort', () => {

            const queryParams = {
                sort: 'name=ASC',
            };

            sandbox.stub(QuerySearch, 'parseSort')
                .withArgs({}, 'name=ASC')
                .returns({
                    name: 1,
                });

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.sort).deep.equal({
                name: 1,
            });
        });

        it('should return sort (array)', () => {

            const queryParams = {
                sort: ['name=ASC'],
            };

            sandbox.stub(QuerySearch, 'parseSort')
                .withArgs({}, 'name=ASC')
                .returns({
                    name: 1,
                });

            const search = QuerySearch.fromQueryParams(queryParams);
            chai.expect(search.sort).deep.equal({
                name: 1,
            });
        });
    });

    /**
     * parseFilter
     */
    describe('parseFilter', () => {

        it('should parse default', () => {

            const queryFilter = 'name=test';
            let filter = {};

            filter = QuerySearch.parseFilter(filter, queryFilter);
            chai.expect(filter).deep.equal({
                name: 'test',
            });
        });

        it('should parse [eq]', () => {

            const queryFilter = 'name[eq]=test';
            let filter = {};

            filter = QuerySearch.parseFilter(filter, queryFilter);
            chai.expect(filter).deep.equal({
                name: {$eq: 'test'},
            });
        });

        it('should parse [eq] (2)', () => {

            const queryFilter = 'name[eq]=';
            let filter = {};

            filter = QuerySearch.parseFilter(filter, queryFilter);
            chai.expect(filter).deep.equal({
                name: {$eq: ''},
            });
        });

        it('should parse [regex]', () => {

            const queryFilter = 'name[regex]=/^monitoring/i';
            let filter = {};

            filter = QuerySearch.parseFilter(filter, queryFilter);
            chai.expect(filter).deep.equal({
                name: {$regex: /^monitoring/i},
            });
        });

        it('should parse [regex] (no modifier)', () => {

            const queryFilter = 'name[regex]=/^monitoring/';
            let filter = {};

            filter = QuerySearch.parseFilter(filter, queryFilter);
            chai.expect(filter).deep.equal({
                name: {$regex: /^monitoring/},
            });
        });

        it('should throw an error when cannot parse [regex]', () => {

            const queryFilter = 'name[regex]=monitoring/i';
            const filter = {};

            chai.expect(() => QuerySearch.parseFilter(filter, queryFilter))
                .to.throw('cannot parse regex <monitoring/i> for parameter <name>');
        });

        it('should throw an error when regex is not valid [regex]', () => {

            const queryFilter = 'name[regex]=/monitoring/oups';
            const filter = {};

            chai.expect(() => QuerySearch.parseFilter(filter, queryFilter))
                .to.throw('</monitoring/oups> is not a valid regex for parameter <name>');
        });

        it('should throw an error when operator is unknown', () => {

            const queryFilter = 'name[uk]=test';

            chai.expect(() => QuerySearch.parseFilter({}, queryFilter))
                .to.throw('filter operator <uk> is unknown');
        });
    });

    /**
     * parseSort
     */
    describe('parseSort', () => {

        it('should parse [ASC]', () => {

            const querySort = 'name=ASC';
            let sort = {};

            sort = QuerySearch.parseSort(sort, querySort);
            chai.expect(sort).deep.equal({
                name: 1,
            });
        });

        it('should parse [DESC]', () => {

            const querySort = 'name=DESC';
            let sort = {};

            sort = QuerySearch.parseSort(sort, querySort);
            chai.expect(sort).deep.equal({
                name: -1,
            });
        });

        it('should throw an error when sort direction is invalid', () => {

            const querySort = 'name=UK';

            chai.expect(() => QuerySearch.parseSort({}, querySort))
                .to.throw('sort direction <UK> is unknown, only <ASC> and <DSC> are allowed');
        });
    });
});
