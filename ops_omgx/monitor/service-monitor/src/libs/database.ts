import mysql from 'mysql'
import util from 'util'
import * as configs from '../configs'
import logger from '../logger'

class Database {
  connection: mysql.Connection
  query: (query: string) => Promise<mysql.Query>

  constructor() {
    this.connection = mysql.createConnection({
      host: configs.mysqlHostUrl,
      port: configs.mysqlPort,
      user: configs.mysqlUsername,
      password: configs.mysqlPassword,
    })
    this.query = util.promisify(this.connection.query).bind(this.connection)
  }

  async initMySQL() {
    logger.info('Initializing the database...')
    await this.query(
      `CREATE DATABASE IF NOT EXISTS ${configs.mysqlDatabaseName}`
    )
  }
}

export default new Database()
