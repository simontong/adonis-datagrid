const {ServiceProvider} = require('@adonisjs/fold')

class DataGridProvider extends ServiceProvider {
  register () {
    this.app.singleton('DataGrid', () => {
      const Config = this.app.use('Adonis/Src/Config')
      const DataGrid = require('../src/DataGrid')
      return new DataGrid(Config)
    })
  }

  boot () {
    const Context = this.app.use('Adonis/Src/HttpContext')
    const DataGrid = this.app.use('DataGrid')

    // add ctx to datagrid
    Context.onReady(ctx => {
      DataGrid.ctx = ctx
    })
  }
}

module.exports = DataGridProvider
