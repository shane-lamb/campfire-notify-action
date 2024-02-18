export interface Commit {
    message: string
    id: string
    url: string
}

export interface JobStep {
    name: string
    status: 'failure' | 'skipped' | 'success' | 'cancelled' | null
}
