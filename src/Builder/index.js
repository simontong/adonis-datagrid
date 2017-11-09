'use strict'

const _ = require('lodash')
const json2csv = require('json2csv')

class Builder {
  constructor (defaults, ctx) {
    this.ctx = ctx
    this.defaults = {}
    this.searchables = []
    this.filterables = {}
    this.sortables = {}

    // merge defaults
    this.setDefaults(defaults)
  }

  /**
   * Query function to use (usually Model.query())
   *
   * @param fn
   * @returns {Builder}
   */
  setQueryFn (fn) {
    if (!_.isFunction(fn)) {
      throw new Error('setQuery accepts a function')
    }
    this.queryFn = fn
    return this
  }

  /**
   * Set defaults
   *
   * @param config
   * @returns {Builder}
   */
  setDefaults (config) {
    // if undefined or some other variation passed in
    if (!_.isPlainObject(config)) {
      config = {}
    }

    // initial defaults (if none passed)
    const initial = {
      page: 1,
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

    // merge new default options
    this.defaults = Object.assign(initial, this.defaults, config)
    return this
  }

  /**
   * Set fields that can be globally searched
   *
   * @param searchables
   * @returns {Builder}
   */
  setSearchables (searchables) {
    if (!_.isArray(searchables)) {
      throw new Error('setSearchable accepts an array')
    }
    this.searchables = searchables
    return this
  }

  /**
   * Set filterable fields
   *
   * @param filterables
   * @returns {Builder}
   */
  setFilterables (filterables) {
    if (!_.isPlainObject(filterables)) {
      throw new Error('setFilterable accepts a plain object')
    }
    this.filterables = filterables
    return this
  }

  /**
   * Set sortable fields
   *
   * @param sortables
   * @returns {Builder}
   */
  setSortables (sortables) {
    if (!_.isPlainObject(sortables)) {
      throw new Error('setSortable accepts a plain object')
    }
    this.sortables = sortables
    return this
  }

  /**
   * Set requested page
   *
   * @param page
   * @returns {Builder}
   */
  setPage (page) {
    page = parseInt(page, 10)
    if (Number.isNaN(page) || page < 1) {
      page = this.defaults.page
    }

    this.page = page
    return this
  }

  /**
   * Set requested rows per page
   *
   * @param perPage
   * @returns {Builder}
   */
  setPerPage (perPage) {
    perPage = parseInt(perPage, 10)
    if (Number.isNaN(perPage)) {
      perPage = this.defaults.perPage
    }
    // set lower limit
    if (perPage < this.defaults.perPageLimit.min) {
      perPage = this.defaults.perPageLimit.min
    }
    // set upper limit
    else if (perPage > this.defaults.perPageLimit.max) {
      perPage = this.defaults.perPageLimit.max
    }

    this.perPage = perPage
    return this
  }

  /**
   * Set requested search
   *
   * @param search
   * @returns {Builder}
   */
  setSearch (search) {
    search = String(search || '').trim()
    if (!search) {
      search = this.defaults.search
    }
    // remove unwanted chars from query
    search = search.replace(/[%_]/g, ' ')

    this.search = search
    return this
  }

  /**
   * Set requested filters
   *
   * @param filters
   * @returns {Builder}
   */
  setFilters (filters) {
    if (!_.isPlainObject(filters)) {
      filters = this.defaults.filters
    }
    for (const [param, filter] of Object.entries(filters)) {
      filters[param] = String(filter || '').trim()
    }
    this.filters = filters
    return this
  }

  /**
   * Set requested sorts
   *
   * @param sorts
   * @returns {Builder}
   */
  setSorts (sorts) {
    sorts = String(sorts || '').trim()
    if (!sorts) {
      sorts = this.defaults.sorts
    }

    this.sorts = sorts
    return this
  }

  /**
   * Apply search query
   *
   * @param query
   */
  applySearch (query) {
    if (!this.search || _.isEmpty(this.searchables)) {
      return
    }
    query.where(q => {
      for (const searchable of this.searchables) {
        // if searchable is function then run it
        if (_.isFunction(searchable)) {
          searchable.call(this, q, this.search)
        }
        else {
          q.orWhere(searchable, 'like', `%${this.search}%`)
        }
      }
    })
  }

  /**
   * Apply filter queries
   *
   * @param query
   */
  applyFilters (query) {
    if (!this.filters || _.isEmpty(this.filterables)) {
      return
    }
    query.where(q => {
      for (const [param, filterable] of Object.entries(this.filterables)) {
        // ignore if filter not found
        if (!this.filters.hasOwnProperty(param)) {
          continue
        }
        // if filter is function then run it
        if (_.isFunction(filterable)) {
          filterable.call(this, q, this.filters[param])
        }
        else {
          q.where(filterable, this.filters[param])
        }
      }
    })
  }

  /**
   * Apply sort queries
   *
   * @param query
   */
  applySorts (query) {
    if (!this.sorts || _.isEmpty(this.sortables)) {
      return
    }
    const sorts = this.sorts.split(',')
    for (const sort of sorts) {
      const desc = sort[0] === '-'
      const param = desc ? sort.substr(1) : sort

      // if param found in sortables
      if (!this.sortables.hasOwnProperty(param)) {
        continue
      }
      // sortable column / function
      const sortable = this.sortables[param]

      // if sortable is function then run it
      if (_.isFunction(sortable)) {
        sortable.call(this, query, sortable, desc)
      }
      else {
        query.orderBy(sortable, desc ? 'desc' : 'asc')
      }
    }
  }

  /**
   * Build query
   *
   * @returns {*}
   */
  make () {
    // apply request params
    const params = this.ctx.request.only(
      Object.values(this.defaults.queryParams)
    )
    this.setPage(params.page)
    this.setPerPage(params.perPage)
    this.setSearch(params.search)
    this.setFilters(params.filter)
    this.setSorts(params.sort)

    // apply query
    const query = this.queryFn.call(this)
    this.applySearch(query)
    this.applyFilters(query)
    this.applySorts(query)

    return query
  }

  /**
   * Return paginated rows
   *
   * @returns {Promise}
   */
  paginate () {
    return this.make().paginate(this.page, this.perPage)
  }

  /**
   * Return csv formatted rows
   *
   * @param exportOptions
   * @returns {Promise}
   */
  async export (exportOptions) {
    const data = await this.make().fetch()

    return json2csv({
      fields: exportOptions.fields,
      data: data.toJSON()
    })
  }
}

module.exports = Builder
