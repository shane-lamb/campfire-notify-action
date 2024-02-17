import * as core from '@actions/core'
import { Commit } from '../src/index'

const inputs: { [key: string]: string } = {
    messages_url: 'https://campfire.domain',
    topic: 'commit_info',
}
const commits: Commit[] = [
    {
        message: 'commit 1 message',
        id: '7b9448126c1e8ba8909928341f125c3bd62a6cf4',
        url: 'https://commit_1_url',
    },
    {
        message: 'commit 2 title\n\ncommit 2 body',
        id: '6dc1dbc6c572dda545b8c1f3c254ad8de0135023',
        url: 'https://commit_2_url',
    },
]
const repo = {
    owner: 'shane-lamb',
    repo: 'campfire-notify-action',
}
const actor = 'shane-lamb'

describe('Campfire GitHub Action', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should post commit info to Campfire', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../src/index')

        expect(execSync).toHaveBeenCalledTimes(2)

        const actualCall1 = execSync.mock.calls[0][0]
        const expectedCall1 = `
curl -d "<a href=\\"https://github.com/shane-lamb\\">shane-lamb</a> committed 
<a href=\\"https://commit_1_url\\">7b94481</a> to 
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
curl -d "<a href=\\"https://github.com/shane-lamb\\">shane-lamb</a> committed 
<a href=\\"https://commit_2_url\\">6dc1dbc</a> to 
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
