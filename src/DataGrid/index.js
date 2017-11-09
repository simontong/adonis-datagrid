'use strict'

const Builder = require('../Builder')

class DataGrid {
  constructor (Config) {
    this.Config = Config
  }

  /**
   * Build up the data grid
   *
   * @param config
   * @returns {*}
   */
  build (config) {
    return (new Builder(this.Config.get('dataGrid.defaults'), this.ctx))
      .setQueryFn(config.query)
      .setDefaults(config.defaults)
      .setSearchables(config.searchable)
      .setFilterables(config.filterable)
      .setSortables(config.sortable)
  }

  /**
   * Return sorted/filtered paginated results
   *
   * @param config
   * @returns {Promise}
   */
  paginate (config) {
    return this.build(config).paginate()
  }

  /**
   * Return sorted/filtered exported results
   *
   * @param config
   * @returns {Promise}
   */
  export (config) {
    return this.build(config).export(config.exportOptions)
  }
}

module.exports = DataGrid
