import { getInput, setFailed } from '@actions/core'
import { context } from '@actions/github'
import { execSync } from 'child_process'

export async function run(): Promise<void> {
    const messagesUrl = getInput('messages_url')
    const commits: Commit[] = context.payload.commits
    if (!commits) {
        throw Error(
            'Could not find commit information in payload. You need to use this action from a "push" event context.',
        )
    }

    for (const commit of commits) {
        postCommitMessage(commit, messagesUrl)
    }
}

function postCommitMessage(commit: Commit, messagesUrl: string): void {
    const { owner, repo } = context.repo

    const commitLink = `<a href="${commit.url}">${commit.id.slice(0, 7)}</a>`
    const repoLink = `<a href="https://github.com/${owner}/${repo}">${owner}/${repo}</a>`
    const actorLink = `<a href="https://github.com/${context.actor}">${context.actor}</a>`
    const header = `${actorLink} committed ${commitLink} to ${repoLink}:`
    const commitBody = commit.message.split('\n\n')
    const commitTitle = `<b>${commitBody.shift()}</b>`
    const message = [header, commitTitle, ...commitBody]
        .join('\n\n')
        .split('\n')
        .join('<br/>')
    execSync(`curl -d ${JSON.stringify(message)} ${messagesUrl}`)
}

// eslint-disable-next-line github/no-then
run().catch((error) => setFailed(error.message))

export interface Commit {
    message: string
    id: string
    url: string
}
