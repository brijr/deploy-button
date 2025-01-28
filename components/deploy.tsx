"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { GitHubLogoIcon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      // Add https:// if not present
      const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
      const parsedUrl = new URL(urlWithProtocol);

      // Verify it's a GitHub URL
      if (!parsedUrl.hostname.includes("github.com")) {
        return null;
      }

      // Remove any trailing slashes and split the path
      const cleanPath = parsedUrl.pathname.replace(/\/$/, "");
      const parts = cleanPath.split("/").filter(Boolean);

      // We need exactly owner and repo
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

    // Add repository URL
    params.set("repository-url", url);

    // Add project and repository names using the GitHub repo name
    params.set("project-name", repoData.name);
    params.set("repository-name", repoData.name);

    // Add environment variables if they exist
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
  <Button asChild className="h-8 px-0 py-0">
    <a
      href="${deployUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://vercel.com/button"
        alt="Deploy with Vercel"
        className="h-full"
      />
    </a>
  </Button>
)`;
  };

  // Add copy functionality
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
    <div className="container max-w-2xl py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-medium">▲ Deploy Button Generator</h1>
        <p className="text-sm text-gray-500">
          Create a deploy button for your GitHub repository that works with
          Vercel.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-600">Selected Repository</label>
          <div className="bg-white border rounded-lg p-4 min-h-[60px] flex items-center">
            {url ? (
              <div className="flex items-center gap-2">
                <GitHubLogoIcon className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">{url}</span>
              </div>
            ) : (
              <span className="text-gray-400">
                Enter a GitHub repository URL below
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col space-y-1">
          <label className="text-sm text-gray-600">Enter Repository URL</label>
          <div className="flex gap-2">
            <Input
              id="repo-url"
              placeholder="github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white border rounded-lg focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-150 min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading</span>
                </>
              ) : (
                <>
                  <GitHubLogoIcon className="h-4 w-4" />
                  <span className="ml-2 text-sm">Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-6">
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 rounded-lg text-red-600"
          >
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {repoData && (
        <div className="mt-8 space-y-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="bg-white border rounded-lg p-4 flex items-center justify-center">
                <a
                  href={generateDeployUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform duration-150 hover:translate-y-[-1px]"
                >
                  <img
                    src="https://vercel.com/button"
                    alt="Deploy with Vercel"
                    className="h-8"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Installation</h3>
            <Tabs defaultValue="markdown" className="w-full">
              <TabsList className="bg-gray-50 rounded-lg p-1">
                <TabsTrigger
                  value="markdown"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none px-4 py-2 text-sm"
                >
                  Markdown
                </TabsTrigger>
                <TabsTrigger
                  value="html"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none px-4 py-2 text-sm"
                >
                  HTML
                </TabsTrigger>
                <TabsTrigger
                  value="jsx"
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-none px-4 py-2 text-sm"
                >
                  shadcn/ui
                </TabsTrigger>
              </TabsList>
              <TabsContent value="markdown">
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="bg-white border rounded-lg p-4 relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        copied === "markdown" && "opacity-100"
                      )}
                      onClick={() =>
                        copyToClipboard(generateMarkdown(), "markdown")
                      }
                    >
                      {copied === "markdown" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      <code>{generateMarkdown()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="html">
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="bg-white border rounded-lg p-4 relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        copied === "html" && "opacity-100"
                      )}
                      onClick={() => copyToClipboard(generateHTML(), "html")}
                    >
                      {copied === "html" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      <code>{generateHTML()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="jsx">
                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                  <div className="bg-white border rounded-lg p-4 relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        copied === "jsx" && "opacity-100"
                      )}
                      onClick={() => copyToClipboard(generateJSX(), "jsx")}
                    >
                      {copied === "jsx" ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="text-sm text-gray-600 overflow-x-auto">
                      <code>{generateJSX()}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {repoData.envVars.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Environment Variables
                </h3>
                <span className="text-xs text-gray-500">
                  {repoData.envVars.length} variables found
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="bg-white border rounded-lg p-4">
                  <ul className="space-y-2">
                    {repoData.envVars.map((env) => (
                      <li
                        key={env}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
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
