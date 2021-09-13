/* External Imports */
import * as fs from 'fs'
import * as path from 'path'

/* Internal Imports */
import { makeRegenesisDump } from '../src/regenesis/make-regenesis'
;(async () => {
  const outdir = path.resolve(__dirname, '../dist/dumps')
  const stateDumpLatestDir = path.join(outdir, 'state-dump.latest.json')
  const stateDumpGenesisDir = path.join(outdir, 'state-dump.genesis.json')

  const stateDumpLatest = JSON.parse(fs.readFileSync(stateDumpLatestDir, 'utf-8'))
  const stateDumpGenesis = JSON.parse(fs.readFileSync(stateDumpGenesisDir, 'utf-8'))

  const dump = makeRegenesisDump(stateDumpLatest, stateDumpGenesis)
  fs.writeFileSync(stateDumpLatestDir, JSON.stringify(dump, null, 4))
})()
