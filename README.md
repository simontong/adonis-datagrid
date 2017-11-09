# adonis-datagrid

Create sorted, filtered and paginated table data from database.
Can also be used to generate CSV data.

<!-- [![npm version][npm-badge]][npm-badge-url]
[![Build Status][travis-badge]][travis-badge-url]
[![Coverage Status][coveralls-badge]][coveralls-badge-url]
[![Dependency Status][dev-badge]][dev-badge-url]-->

## How to use

Install npm module:

```bash
$ adonis install adonis-datagrid
```

## Register provider

Once you have installed adonis-datagrid, make sure to register the provider inside `start/app.js` in order to make use of it.

```js
const providers = [
  'adonis-datagrid/providers/DataGridProvider'
]
```

## Using the module:

Send JSON response:

```js
const DataGrid = use('DataGrid')

Route.get('/api/users', async () => {
  const config = {
    // base query
    query () {
      return use('App/Models/User').query()
    },

    // <GET param>:<DB column> for sortable columns
    sortable: {
      id: 'id',
      username: 'username',
      email: 'email',
      created: 'created_at',
      deleted (query, value) {
        query[+value ? 'whereNotNull' : 'whereNull']('deleted_at')
      }
    },

    // global searchable fields
    searchable: ['username', 'email'],

    // <GET param>:<DB column> for filterable columns
    filterable: {
      username: 'username',
    },

    // csv export options
    exportOptions: {
      fields: [
        {label: 'ID', value: 'id'},
        {label: 'Username', value: 'username'},
        {label: 'Email', value: 'email'},
        {label: 'Created', value: 'created_at'},
        {
          label: 'Deleted',
          value: row => row.deleted_at ? 'YES' : 'NO',
        },
      ]
    }
  }

  // send JSON response
  return DataGrid.paginate(config)
})

```

Send as CSV:

```js
Route.get('/api/users/export', async ({response}) => {
  const csv = await DataGrid.export(/* config here */)
  response.header('content-type', 'text/csv')
  response.header('content-disposition', `attachment; filename="export.csv"`)

  // send CSV data
  return csv
})
```

## Examples

`[GET] /users?search=simon&sort=-username`
```json
{
  "total": 3,
  "perPage": 10,
  "page": 1,
  "lastPage": 1,
  "data": [
    {
      "id": 3,
      "username": "timtam",
      "email": "tim@wasussu.mh"
    },
    {
      "id": 2,
      "username": "simon",
      "email": "simon@wasussu.mh"
    },
    {
      "id": 4,
      "username": "jamiesimons",
      "email": "jamie@example.com"
    },
  ]
}
```

`[GET] /api/users?filter[username]=simon`
```json
{
  "total": 1,
  "perPage": 10,
  "page": 1,
  "lastPage": 1,
  "data": [
    {
      "id": 2,
      "username": "simon",
      "email": "simon@wasussu.mh"
    },
  ]
}
```

`[GET] /api/users/export?search=simon&sort=id`
```
"ID","Username","Email","Created","Deleted"
2,"simon","simon@wasussu.mh","2017-11-07 10:24:43","NO"
3,"timtam","tim@wasussu.mh","2017-05-04 11:14:13","NO"
4,"jamiesimons","jamie@example.com","2017-10-04 16:24:23","NO"
```

## Configuration options

- `query` - **(required)** Base query.
- `defaults` - Default options.
  - `page` - Initial page. Default: `1`.
  - `perPageLimit` - Limits on rows per page.
    - `min` - Upper limit. Default: `5`.
    - `max` - Lower limit. Default: `100`.
  - `search` - Search (for `searchable` fields). Default: `''`.
  - `filters` - Fitlers (for `filterable` fields). Default : `{}`.
  - `sorts` - Sorted (for `sortable` fields). Default: `{}`.
  - `queryParams` - GET params that appear in URL.
    - `page` - Current page. Default: `'page'`.
    - `perPage` - Rows per page. Default: `'perPage'`.
    - `search` - Search. Default: `'search'`.
    - `filter` - Filters. Default: `'filter'`.
    - `sort` - Sorted. Default: `'sort'`.
- `sortable` - Simple object where key is the GET param and value is the database column. For more custom database queries you an pass a function as the value which receieves two arguments: `query`, `sortable` (GET param) and `descending` (boolean).
- `searchable` - Array containing column names for global search. For more custom queries you can pass a function as one of the array items which receives `search` as its argument.
- `exportOptions` - Configuration options for CSV export. See [json2csv](https://github.com/zemirco/json2csv#available-options) for options.
- `filterable` - Simple object where key is the GET param and value is the database column. For more custom database queries you an pass a function as the value which receieves two arguments: `query` and `value` (GET param value).

## Built With

* [AdonisJS](http://adonisjs.com) - The web framework used.
* [json2csv](https://github.com/zemirco/json2csv) - Used to generate CSV data.

## Versioning

[SemVer](http://semver.org/) is used for versioning. For the versions available, see the [tags on this repository](https://github.com/simontong/adonis-datagrid/tags).  

## Authors

* **Simon Tong** - *Developer* - [simontong](https://github.com/simontong)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
