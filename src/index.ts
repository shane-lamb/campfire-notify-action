import { setFailed } from '@actions/core'
import { run } from './main'

// eslint-disable-next-line github/no-then
run().catch((error) => setFailed(error.message))
