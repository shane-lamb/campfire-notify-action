import * as core from '@actions/core'
import { Commit } from '../src/index'

const inputs: { [key: string]: string } = {
    messages_url: 'https://campfire.domain',
    topic: 'commit_info',
}
const commits: Commit[] = [
    {
        message: 'commit 1 message',
        id: 'commit_1_id',
        url: 'https://commit_1_url',
    },
    {
        message: 'commit 2 title\n\ncommit 2 body',
        id: 'commit_2_id',
        url: 'https://commit_2_url',
    },
]
const repo = {
    owner: 'shane-lamb',
    repo: 'campfire-notify-action',
}
const actor = 'shane-lamb'

describe('index', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('runs without error', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../src/index')

        expect(execSync).toHaveBeenCalledTimes(2)

        const actualCall1 = execSync.mock.calls[0][0]
        const expectedCall1 = `
curl -d "<b>shane-lamb</b> committed 
<a href=\\"https://commit_1_url\\">commit_1_id</a> to 
<a href=\\"https://github.com/shane-lamb/campfire-notify-action\\">shane-lamb/campfire-notify-action</a>:
<br/><br/><b>commit 1 message</b>" 
https://campfire.domain
        `
            .trim()
            .split('\n')
            .join('')
        expect(actualCall1).toEqual(expectedCall1)

        const actualCall2 = execSync.mock.calls[1][0]
        const expectedCall2 = `
curl -d "<b>shane-lamb</b> committed 
<a href=\\"https://commit_2_url\\">commit_2_id</a> to 
<a href=\\"https://github.com/shane-lamb/campfire-notify-action\\">shane-lamb/campfire-notify-action</a>:
<br/><br/><b>commit 2 title</b><br/><br/>
commit 2 body" 
https://campfire.domain
        `
            .trim()
            .split('\n')
            .join('')
        expect(actualCall2).toEqual(expectedCall2)
    })
})

const execSync = jest.fn()
jest.mock('child_process', () => ({
    execSync,
}))

jest.spyOn(core, 'getInput').mockImplementation((key) => {
    if (!inputs[key]) throw new Error(`Unknown input: ${key}`)
    return inputs[key]
})

jest.mock('@actions/github', () => ({
    context: {
        payload: {
            commits,
        },
        repo,
        actor,
    },
}))
