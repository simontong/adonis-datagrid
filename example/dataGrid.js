'use strict'

module.exports = {
  defaults: {
    perPage: 25,
    perPageLimit: {min: 5, max: 100},
    search: '',
    filters: {},
    sorts: '',
    queryParams: {
      page: 'page',
      perPage: 'perPage',
      search: 'search',
      filter: 'filter',
      sort: 'sort'
    },
  }
}
