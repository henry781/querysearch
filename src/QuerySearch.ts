export class QuerySearch {

    /**
     * Create a query search from request
     * @param queryParams
     */
    public static fromQueryParams(queryParams: { [key: string]: string | string[] }): QuerySearch {

        let filter = {};
        let sort = {};

        const queryFilter = queryParams.filter;
        if (queryFilter) {
            if (Array.isArray(queryFilter)) {
                queryFilter.forEach((f: string) => {
                    filter = this.parseFilter(filter, f);
                });

            } else {
                filter = this.parseFilter(filter, queryFilter);
            }
        }

        const querySort = queryParams.sort;
        if (querySort) {
            if (Array.isArray(querySort)) {
                querySort.forEach((s: string) => {
                    sort = this.parseSort(sort, s);
                });

            } else {
                sort = this.parseSort(sort, querySort);
            }
        }

        const offset = queryParams.offset && !Array.isArray(queryParams.offset)
            ? parseInt(queryParams.offset, 10) : undefined;
        const limit = queryParams.limit && !Array.isArray(queryParams.limit)
            ? parseInt(queryParams.limit, 10) : undefined;

        return new QuerySearch(filter, sort, offset, limit);
    }

    /**
     * Parse queryFilter
     * @param filter
     * @param queryFilter
     */
    public static parseFilter(filter: object, queryFilter: string): object {

        const [filterName, filterValue] = queryFilter.split('=');

        const exec = /(.+)\[(.+)\]/g.exec(filterName);

        if (!exec) {
            filter[filterName] = filterValue;
            return filter;
        }

        const [, filterField, filterOperator] = exec;

        switch (filterOperator) {

            case 'eq': {
                filter[filterField] = {
                    $eq: filterValue,
                };
                return filter;
            }

            case 'regex': {
                const regexParts = /\/(.*)\/(.*)/.exec(filterValue);
                if (!regexParts) {
                    throw new Error(`cannot parse regex <${filterValue}> for parameter <${filterField}>`);
                }

                try {
                    filter[filterField] = {
                        $regex: new RegExp(regexParts[1], regexParts[2]),
                    };
                    return filter;
                } catch (err) {
                    throw new Error(`<${filterValue}> is not a valid regex for parameter <${filterField}>`);
                }
            }

            default:
                throw new Error(`filter operator <${filterOperator}> is unknown`);
        }
    }

    /**
     * Parse querySort
     * @param sort
     * @param querySort
     */
    public static parseSort(sort: object, querySort: string): object {

        const [sortField, sortDirection] = querySort.split('=');

        if (!sortField) {
            throw new Error('sort field is not set');
        }

        switch (sortDirection) {

            case 'ASC': {
                sort[sortField] = 1;
                return sort;
            }

            case 'DESC': {
                sort[sortField] = -1;
                return sort;
            }

            default:
                throw new Error(`sort direction <${sortDirection}> is unknown, only <ASC> and <DSC> are allowed`);
        }
    }

    private _filter: object;

    public get filter(): object {
        return this._filter;
    }

    private _sort: object;

    public get sort(): object {
        return this._sort;
    }

    private _offset: number;

    public get offset(): number {
        return this._offset;
    }

    public set offset(value: number) {
        this._offset = value;
    }

    private _limit: number;

    public get limit(): number {
        return this._limit;
    }

    public set limit(value: number) {
        this._limit = value;
    }

    /**
     * Constructor
     * @param filter
     * @param sort
     * @param offset
     * @param limit
     */
    constructor(
        filter: object = {},
        sort: object = {},
        offset?: number,
        limit?: number) {

        this._filter = filter;
        this._sort = sort;
        this._offset = offset;
        this._limit = limit;
    }
}
