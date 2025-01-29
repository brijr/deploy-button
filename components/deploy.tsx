"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubLogoIcon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RepoData {
  name: string;
  fullName: string;
  description: string;
  envVars: string[];
}

interface CodeBlockProps {
  code: string;
  language: "markdown" | "html" | "jsx";
  label: string;
  onCopy: (text: string, type: "markdown" | "html" | "jsx") => Promise<void>;
  copied: "markdown" | "html" | "jsx" | null;
}

const CodeBlock = ({
  code,
  language,
  label,
  onCopy,
  copied,
}: CodeBlockProps) => (
  <div className="border overflow-hidden">
    <div className="flex items-center justify-between border-b px-2 sm:px-4 py-2 bg-accent/30">
      <span className="text-xs sm:text-sm text-muted-foreground truncate">
        {label}
      </span>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={() => onCopy(code, language)}
      >
        {copied === language ? (
          <>
            <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Copy</span>
          </>
        )}
      </Button>
    </div>
    <div className="p-2 sm:p-4 bg-accent/30">
      <pre className="text-xs sm:text-sm">
        <code className="block sm:whitespace-pre whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </div>
  </div>
);

interface UrlFormProps {
  url: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onUrlChange: (value: string) => void;
}

const UrlForm = ({ url, loading, onSubmit, onUrlChange }: UrlFormProps) => (
  <form
    onSubmit={onSubmit}
    className="px-3 sm:px-6 pt-2 sm:pt-4 pb-3 sm:pb-6 w-full bg-accent/30"
  >
    <div className="flex flex-col space-y-2">
      <label className="text-base sm:text-lg">Enter Repository URL</label>
      <div className="grid sm:flex gap-2">
        <Input
          id="repo-url"
          placeholder="github.com/owner/repo"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className="bg-background"
        />
        <Button size="lg" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading</span>
            </>
          ) : (
            <>
              <GitHubLogoIcon className="h-4 w-4 mr-2" />
              <span>Generate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  </form>
);

interface PreviewProps {
  deployUrl: string;
}

const Preview = ({ deployUrl }: PreviewProps) => (
  <motion.div
    className="space-y-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h3 className="text-base sm:text-lg">Preview</h3>
    <div className="border bg-accent/30 p-3 sm:p-6 h-[82px] flex items-center justify-center">
      <a href={deployUrl} target="_blank" rel="noopener noreferrer">
        <img src="https://vercel.com/button" alt="Deploy with Vercel" />
      </a>
    </div>
  </motion.div>
);

interface EnvVarsProps {
  vars: string[];
}

const EnvVars = ({ vars }: EnvVarsProps) => (
  <motion.div
    className="space-y-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.4 }}
  >
    <div className="flex items-center justify-between">
      <h3 className="text-base sm:text-lg">Environment Variables</h3>
      <span className="text-xs sm:text-sm text-muted-foreground">
        {vars.length} variables found
      </span>
    </div>
    <div className="border bg-accent/30">
      <ul className="divide-y">
        {vars.map((env) => (
          <li key={env} className="p-2 sm:p-3 font-mono text-xs sm:text-sm">
            {env}
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

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

      if (!parsedUrl.hostname.includes("github.com")) return null;

      const cleanPath = parsedUrl.pathname.replace(/\/$/, "");
      const parts = cleanPath.split("/").filter(Boolean);

      if (parts.length !== 2) return null;

      const [owner, repo] = parts;
      return { owner, repo };
    } catch (_) {
      return null;
    }
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

  const fetchRepoData = async (owner: string, repo: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/repo-info?owner=${owner}&repo=${repo}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch repository data");
      }

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

  return (
    <div className="border max-w-xl mx-auto w-full text-lg">
      <UrlForm
        url={url}
        loading={loading}
        onSubmit={handleSubmit}
        onUrlChange={setUrl}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            className="px-3 sm:px-6 pb-3 sm:pb-6 border-b"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {repoData && (
          <motion.div
            className="space-y-6 sm:space-y-8 border-t p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Preview deployUrl={generateDeployUrl()} />

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-base sm:text-lg">Installation</h3>
              <Tabs defaultValue="markdown" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="markdown" className="flex-1 text-sm">
                    Markdown
                  </TabsTrigger>
                  <TabsTrigger value="html" className="flex-1 text-sm">
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="jsx" className="flex-1 text-sm">
                    shadcn/ui
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="markdown">
                  <CodeBlock
                    code={generateMarkdown()}
                    language="markdown"
                    label="Markdown"
                    onCopy={copyToClipboard}
                    copied={copied}
                  />
                </TabsContent>
                <TabsContent value="html">
                  <CodeBlock
                    code={generateHTML()}
                    language="html"
                    label="HTML"
                    onCopy={copyToClipboard}
                    copied={copied}
                  />
                </TabsContent>
                <TabsContent value="jsx">
                  <CodeBlock
                    code={generateJSX()}
                    language="jsx"
                    label="shadcn/ui button"
                    onCopy={copyToClipboard}
                    copied={copied}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>

            {repoData.envVars.length > 0 && <EnvVars vars={repoData.envVars} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
