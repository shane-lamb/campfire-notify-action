import { getInput, info } from '@actions/core'
import { context } from '@actions/github'
import { execSync } from 'child_process'
import { Commit } from './types'

export async function run(): Promise<void> {
    const template = getInput('template')

    if (template === 'commit_pushed') {
        postCommitMessages()
    } else if (template === 'job_failed') {
        postJobFailureMessage()
    } else if (template === 'no_op') {
        info('In no-op mode. Logging GitHub context object.')
        info(JSON.stringify(context, null, 2))
    } else {
        throw Error(`Invalid template specified: ${template}`)
    }
}

function postJobFailureMessage(): void {
    const { payload } = context
    const headCommit: Commit = payload.head_commit
    const runName = headCommit.message.split('\n\n')[0]
    const header = `❌ <b>${runName}</b>`
    const runLink = `<a href="${payload.repository?.html_url}/actions/runs/${context.runId}">${context.workflow}</a>`
    const breadcrumbs = `${runLink} → ${context.job}`
    const message = [header, breadcrumbs].join('<br/><br/>')
    postMessage(message)
}

function postCommitMessages(): void {
    const commits: Commit[] = context.payload.commits
    if (!commits) {
        throw Error(
            'Could not find commit information in payload. You need to use this action from a "push" event context.',
        )
    }

    for (const commit of commits) {
        postCommitMessage(commit)
    }
}

function postCommitMessage(commit: Commit): void {
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
    postMessage(message)
}

function postMessage(message: string): void {
    const messagesUrl = getInput('messages_url')
    execSync(`curl -d ${JSON.stringify(message)} ${messagesUrl}`)
}
