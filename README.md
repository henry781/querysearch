# QuerySearch

This library translates URL query params to a standard object including filter, sort, limit and offset.

let's consider this request url: 
```
http://api/planets?
    filter=star=sun&
    filter=type=terrestrial&
    filter=name[regex]=/^e/&
    sort=name=ASC&
    offset=0&
    limit=10
```

Express.js or some other frameworks will produce a queryParams object:
```
const queryparams = {
   filter: [ 'star=sun', 'type=terrestrial', name[regex]=/^e/' ],
   sort: ['name=ASC'],
   offset: 0,
   limit: 10
}
```

QuerySearch can parse each queryParam and returns:
```
const querySearch = QuerySearch.fromQueryParams(queryParams);
console.log(querySearch);
{
    filter: {
        star: { $eq: 'sun' },
        type: { $eq: 'terrestrial' },
        name: { $regex: /^e/ }
    },
    sort: {
        name: 1
    },
    offset: 0,
    limit: 10
}
```

It returns a clean search object you can use in your app!

Filter object is based on mongodb operators but there is no dependency with mongodb.


## Filter

### Simple filters

``
/planets?filter=star=sun&filter=type=terrestrial
``

will produce:

```
{
    star: { $eq: 'sun' },
    type: { $eq: 'terrestrial' }
}
```

### Operators

``
/planets?filter=name[regex]=/^ea/
``

will produce:

```
{
    name: { $regex: /^ea/ }
}
```

## Sort

``
/planets?sort=name=ASC
``

will produce:

```
{
    name: 1
}
```


## Limit & Offset

``
/planets?limit=10&offset=20
``

will produce:

```
{
    limit: 10,
    offset: 20
}
```
