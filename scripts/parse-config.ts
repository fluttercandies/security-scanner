import * as core from '@actions/core'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { z } from 'zod'

const RepoSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().optional(),
  options: z.string().optional(),
})

const ConfigSchema = z.object({
  default_options: z.string().optional(),
  repositories: z.array(RepoSchema).optional().default([]),
})

async function run() {
  try {
    const configPath = 'cicd-security-analysis-config.yaml'
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const configRaw = yaml.load(fileContents)
    const config = ConfigSchema.parse(configRaw)

    const targetRepo = process.env.TARGET_REPO?.trim() || ''

    const defaultOptions = config.default_options || ''
    const repos = (config.repositories || [])
      .filter((repo) => repo.enabled !== false)
      .filter((repo) => {
        if (!targetRepo) return true
        return repo.name === targetRepo
      })
      .map((repo) => {
        const repoOptions = repo.options?.trim()
        const finalOptions = repoOptions && repoOptions.length > 0 ? repoOptions : defaultOptions
        return {
          name: repo.name,
          options: finalOptions,
        }
      })

    const matrixJson = JSON.stringify(repos)
    core.setOutput('matrix', matrixJson)

    console.info(`✅ Generated matrix for ${repos.length} repos:`)
    repos.forEach((repo) => console.info(`  - ${repo.name}`))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    core.setFailed(`zizmor scan failed: ${message}`)
  }
}

run()
