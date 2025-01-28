import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { message: "Missing owner or repo parameter" },
      { status: 400 }
    );
  }

  try {
    // Fetch repository information
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN
            ? {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
              }
            : {}),
        },
      }
    );
    if (!repoResponse.ok) {
      throw new Error("Repository not found");
    }

    const repoData = await repoResponse.json();

    // Fetch .env.example content if it exists
    const envResponse = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/.env.example`
    );

    let envVars: string[] = [];
    if (envResponse.ok) {
      const envContent = await envResponse.text();
      envVars = envContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => line.split("=")[0]);
    }

    return NextResponse.json({
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      envVars,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch repository data",
      },
      { status: 500 }
    );
  }
}
