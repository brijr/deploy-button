"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"

interface RepoData {
  name: string
  fullName: string
  description: string
  envVars: string[]
}

export default function DeployButtonGenerator() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [error, setError] = useState("")

  const parseGitHubUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      const [, owner, repo] = parsedUrl.pathname.split("/")
      return { owner, repo }
    } catch (e) {
      return null
    }
  }

  const fetchRepoData = async (owner: string, repo: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/repo-info?owner=${owner}&repo=${repo}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Failed to fetch repository data")

      setRepoData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch repository data")
      setRepoData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseGitHubUrl(url)
    if (!parsed) {
      setError("Invalid GitHub repository URL")
      return
    }
    fetchRepoData(parsed.owner, parsed.repo)
  }

  const generateDeployUrl = () => {
    if (!repoData) return ""
    const baseUrl = "https://vercel.com/new/clone"
    const params = new URLSearchParams()

    // Add repository URL
    params.set("repository-url", url)

    // Add project and repository names using the GitHub repo name
    params.set("project-name", repoData.name)
    params.set("repository-name", repoData.name)

    // Add environment variables if they exist
    if (repoData.envVars.length > 0) {
      params.set("env", repoData.envVars.join(","))
      params.set("envDescription", `Environment variables required for ${repoData.name}`)
    }

    return `${baseUrl}?${params.toString()}`
  }

  const generateMarkdown = () => {
    const deployUrl = generateDeployUrl()
    return `[![Deploy with Vercel](https://vercel.com/button)](${deployUrl})`
  }

  const generateHTML = () => {
    const deployUrl = generateDeployUrl()
    return `<a href="${deployUrl}"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>`
  }

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Vercel Deploy Button Generator</CardTitle>
          <CardDescription>Generate a deploy button for your GitHub repository</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">GitHub Repository URL</Label>
              <div className="flex gap-2">
                <Input
                  id="repo-url"
                  placeholder="https://github.com/owner/repo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubLogoIcon className="h-4 w-4" />}
                  <span className="ml-2">Generate</span>
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {repoData && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Preview</h3>
                <Card className="p-4">
                  <a href={generateDeployUrl()} target="_blank" rel="noopener noreferrer">
                    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
                  </a>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Installation</h3>
                <Tabs defaultValue="markdown">
                  <TabsList>
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                  </TabsList>
                  <TabsContent value="markdown">
                    <Card className="p-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{generateMarkdown()}</code>
                      </pre>
                    </Card>
                  </TabsContent>
                  <TabsContent value="html">
                    <Card className="p-4">
                      <pre className="text-sm overflow-x-auto">
                        <code>{generateHTML()}</code>
                      </pre>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {repoData.envVars.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Environment Variables</h3>
                  <Card className="p-4">
                    <ul className="list-disc list-inside space-y-1">
                      {repoData.envVars.map((env) => (
                        <li key={env} className="text-sm">
                          {env}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

