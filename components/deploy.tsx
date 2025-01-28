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
import { GitHubLogoIcon } from "@radix-ui/react-icons";
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

  const parseGitHubUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const [, owner, repo] = parsedUrl.pathname.split("/");
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

  return (
    <div className="container max-w-2xl py-20">
      <Card className="border-0 shadow-none rounded-none bg-white">
        <CardHeader className="space-y-4 pb-10">
          <CardTitle className="text-2xl font-normal tracking-tight">
            Deploy Button Generator
          </CardTitle>
          <CardDescription className="text-sm text-neutral-600">
            A tool for generating repository deployment buttons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="repo-url"
                className="text-xs font-normal text-neutral-600"
              >
                Repository URL
              </Label>
              <div className="flex gap-3">
                <Input
                  id="repo-url"
                  placeholder="https://github.com/owner/repo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="rounded-none border-neutral-200 focus-visible:ring-0 focus-visible:border-neutral-900 transition-colors duration-150"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-none bg-neutral-900 hover:bg-neutral-800 transition-colors duration-150"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GitHubLogoIcon className="h-4 w-4" />
                  )}
                  <span className="ml-2 text-sm">
                    {loading ? "Loading..." : "Generate"}
                  </span>
                </Button>
              </div>
            </div>
          </form>

          {error && (
            <Alert
              variant="destructive"
              className="rounded-none border-red-200 bg-red-50 animate-in fade-in duration-200"
            >
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {repoData && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h3 className="text-sm font-normal text-neutral-600">
                  Preview
                </h3>
                <Card className="p-6 rounded-none border-neutral-100">
                  <a
                    href={generateDeployUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-transform duration-150 hover:translate-y-[-1px] inline-block"
                  >
                    <img
                      src="https://vercel.com/button"
                      alt="Deploy with Vercel"
                      className="h-8"
                    />
                  </a>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-normal text-neutral-600">
                  Installation
                </h3>
                <Tabs defaultValue="markdown" className="w-full">
                  <TabsList className="rounded-none border-b border-neutral-100 w-full justify-start h-auto p-0 bg-transparent">
                    <TabsTrigger
                      value="markdown"
                      className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 data-[state=active]:shadow-none px-4 py-2 text-sm transition-colors duration-150"
                    >
                      Markdown
                    </TabsTrigger>
                    <TabsTrigger
                      value="html"
                      className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-neutral-900 data-[state=active]:shadow-none px-4 py-2 text-sm transition-colors duration-150"
                    >
                      HTML
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="markdown"
                    className="animate-in fade-in-50 duration-150"
                  >
                    <Card className="rounded-none border-neutral-100 p-4">
                      <pre className="text-sm text-neutral-600 overflow-x-auto">
                        <code>{generateMarkdown()}</code>
                      </pre>
                    </Card>
                  </TabsContent>
                  <TabsContent
                    value="html"
                    className="animate-in fade-in-50 duration-150"
                  >
                    <Card className="rounded-none border-neutral-100 p-4">
                      <pre className="text-sm text-neutral-600 overflow-x-auto">
                        <code>{generateHTML()}</code>
                      </pre>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {repoData.envVars.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-normal text-neutral-600">
                    Environment Variables
                  </h3>
                  <Card className="rounded-none border-neutral-100 p-4">
                    <ul className="list-none space-y-2">
                      {repoData.envVars.map((env) => (
                        <li key={env} className="text-sm text-neutral-600">
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
  );
};
