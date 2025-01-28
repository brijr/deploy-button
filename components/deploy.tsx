"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubLogoIcon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";

interface RepoData {
  name: string;
  fullName: string;
  description: string;
  envVars: string[];
}

export const Deploy = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"markdown" | "html" | "jsx" | null>(
    null
  );

  const parseGitHubUrl = (url: string) => {
    try {
      const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
      const parsedUrl = new URL(urlWithProtocol);

      if (!parsedUrl.hostname.includes("github.com")) {
        return null;
      }

      const cleanPath = parsedUrl.pathname.replace(/\/$/, "");
      const parts = cleanPath.split("/").filter(Boolean);

      if (parts.length !== 2) {
        return null;
      }

      const [owner, repo] = parts;
      return { owner, repo };
    } catch (e) {
      return null;
    }
  };

  const fetchRepoData = async (owner: string, repo: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/repo-info?owner=${owner}&repo=${repo}`
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to fetch repository data");

      setRepoData(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to fetch repository data"
      );
      setRepoData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("Invalid GitHub repository URL");
      return;
    }
    fetchRepoData(parsed.owner, parsed.repo);
  };

  const generateDeployUrl = () => {
    if (!repoData) return "";
    const baseUrl = "https://vercel.com/new/clone";
    const params = new URLSearchParams();

    params.set("repository-url", url);
    params.set("project-name", repoData.name);
    params.set("repository-name", repoData.name);

    if (repoData.envVars.length > 0) {
      params.set("env", repoData.envVars.join(","));
      params.set(
        "envDescription",
        `Environment variables required for ${repoData.name}`
      );
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const generateMarkdown = () => {
    const deployUrl = generateDeployUrl();
    return `[![Deploy with Vercel](https://vercel.com/button)](${deployUrl})`;
  };

  const generateHTML = () => {
    const deployUrl = generateDeployUrl();
    return `<a href="${deployUrl}"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>`;
  };

  const generateJSX = () => {
    const deployUrl = generateDeployUrl();
    return `import { Button } from "@/components/ui/button"

export const DeployButton = () => (
  <Button asChild>
    <a
      href="${deployUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://vercel.com/button"
        alt="Deploy with Vercel"
      />
    </a>
  </Button>
)`;
  };

  const copyToClipboard = async (
    text: string,
    type: "markdown" | "html" | "jsx"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="border max-w-xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 w-full">
        <div className="flex flex-col space-y-1">
          <label>Enter Repository URL</label>
          <div className="flex gap-2">
            <Input
              id="repo-url"
              placeholder="github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <GitHubLogoIcon />
                  <span>Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-6 border-b">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {repoData && (
        <div className="space-y-8 border-t p-6">
          <div className="space-y-2">
            <h3>Preview</h3>
            <div className="border bg-accent/30 p-6">
              <div className="flex items-center justify-center">
                <a
                  href={generateDeployUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://vercel.com/button"
                    alt="Deploy with Vercel"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3>Installation</h3>
            <Tabs defaultValue="markdown">
              <TabsList>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="jsx">shadcn/ui</TabsTrigger>
              </TabsList>
              <TabsContent value="markdown">
                <div className="border">
                  <div className="flex items-center justify-between border-b px-4 py-2 bg-accent/30">
                    <span className="text-sm text-muted-foreground">
                      Markdown
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generateHTML(), "html")}
                    >
                      {copied === "markdown" ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span className="sr-only">Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-4 bg-accent/30">
                    <pre className="text-sm overflow-x-auto no-scrollbar">
                      <code>{generateMarkdown()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="html">
                <div className="border">
                  <div className="flex items-center justify-between border-b px-4 py-2 bg-accent/30">
                    <span className="text-sm text-muted-foreground">HTML</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generateHTML(), "html")}
                    >
                      {copied === "html" ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span className="sr-only">Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-4 bg-accent/30">
                    <pre className="text-sm overflow-x-auto no-scrollbar">
                      <code>{generateHTML()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="jsx">
                <div className="border">
                  <div className="flex items-center justify-between border-b px-4 py-2 bg-accent/30">
                    <span className="text-sm text-muted-foreground">
                      shadcn/ui Button Component
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generateHTML(), "html")}
                    >
                      {copied === "jsx" ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span className="sr-only">Copied!</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-4 bg-accent/30">
                    <pre className="text-sm overflow-x-auto no-scrollbar">
                      <code className="grid gap-4">{generateJSX()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {repoData.envVars.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3>Environment Variables</h3>
                <span>{repoData.envVars.length} variables found</span>
              </div>
              <div>
                <div>
                  <ul className="space-y-2">
                    {repoData.envVars.map((env) => (
                      <li
                        key={env}
                        className="border p-2 font-mono bg-accent/30"
                      >
                        <span />
                        {env}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
