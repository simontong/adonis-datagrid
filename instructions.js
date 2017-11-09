'use strict'

const path = require('path')

module.exports = async function (cli) {
  try {
    await cli.copy(
      path.join(__dirname, './example/dataGrid.js'),
      path.join(cli.helpers.configPath(), 'dataGrid.js')
    )
    cli.command.completed('create', 'config/dataGrid.js')
  }
  catch (error) {
    // ignore error
  }
}
