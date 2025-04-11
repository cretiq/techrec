import { Octokit } from "@octokit/rest"

export class GitHubClient {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    })
  }

  async getUserProfile() {
    const { data } = await this.octokit.users.getAuthenticated()
    return data
  }

  async getUserRepositories() {
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    })
    return data
  }

  async getRepositoryDetails(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    })
    return data
  }

  async getRepositoryLanguages(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listLanguages({
      owner,
      repo,
    })
    return data
  }

  async getRepositoryContributors(owner: string, repo: string) {
    const { data } = await this.octokit.repos.listContributors({
      owner,
      repo,
    })
    return data
  }

  async getRepositoryReadme(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner,
        repo,
      })
      return Buffer.from(data.content, "base64").toString()
    } catch (error) {
      return null
    }
  }

  async getUserContributions(username: string) {
    const { data } = await this.octokit.activity.listEventsForAuthenticatedUser({
      username,
      per_page: 100,
    })
    return data
  }
} 