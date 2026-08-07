import * as exec from '@actions/exec'
import * as core from '@actions/core'

async function run() {
  try {
    const env = {
      ...process.env,
      GH_TOKEN: process.env.GH_TOKEN || '',
      ZIZMOR_CONFIG: process.env.ZIZMOR_CONFIG || '',
    }

    const options = (process.env.REPO_OPTIONS || '').trim()
    const args = options ? options.split(/\s+/).filter((s) => s.length > 0) : []
    args.push('.')

    console.info(`Running: zizmor ${args.join(' ')}`)

    const exitCode = await exec.exec('zizmor', args, {
      cwd: 'target-repo',
      stdio: 'inherit',
      env: env,
    })

    if (exitCode !== 0) {
      throw new Error(`zizmor exited with code ${exitCode}`)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    core.setFailed(`zizmor scan failed: ${message}`)
  }
}

run()
