import * as core from '@actions/core'
import { run } from '../src/main'
import { execSync } from 'child_process'

jest.mock('@actions/github', () => ({
    context: {
        payload: {
            commits: [
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
            ],
            head_commit: {
                message: 'commit 2 title\n\ncommit 2 body',
            },
            repository: {
                html_url: 'https://github.com/my-org/my-repo',
            },
        },
        repo: {
            owner: 'shane-lamb',
            repo: 'campfire-notify-action',
        },
        actor: 'shane-lamb',
        workflow: 'CI',
        job: 'test',
        runId: 7946222982,
    },
}))

const inputs: { [key: string]: string } = {
    messages_url: 'https://campfire.domain',
}

describe('Campfire GitHub Action', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should post commit info to Campfire', async () => {
        inputs.template = 'commit_pushed'

        await run()

        expect(execSync).toHaveBeenCalledTimes(2)

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
        expect(calledWith(execSync)).toEqual(expectedCall1)

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
        expect(calledWith(execSync, 1)).toEqual(expectedCall2)
    })
    it('should notify of failed job', async () => {
        inputs.template = 'job_failed'

        await run()

        expect(execSync).toHaveBeenCalledTimes(1)

        const expectedCall = `
curl -d "❌ <b>commit 2 title</b><br/><br/>
<a href=\\"https://github.com/my-org/my-repo/actions/runs/7946222982\\">Job failed</a>: 
CI → test" 
https://campfire.domain
        `
            .trim()
            .split('\n')
            .join('')
        expect(calledWith(execSync)).toEqual(expectedCall)
    })
})

jest.spyOn(core, 'getInput').mockImplementation((key) => {
    if (!inputs[key]) throw new Error(`Unknown input: ${key}`)
    return inputs[key]
})

jest.mock('child_process', () => {
    return {
        execSync: jest.fn(),
    }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calledWith(mock: unknown, index = 0): any {
    return (mock as jest.Mock).mock.calls[index][0]
}
