import { Craft, Section, Container } from "@/components/craft";
import { Deploy } from "@/components/deploy";
import Balancer from "react-wrap-balancer";

import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Home() {
  return (
    <Section className="w-full px-4">
      <Container className="space-y-12 max-w-3xl mx-auto">
        <Craft className="space-y-6 sm:space-y-12">
          <div className="flex items-center sm:justify-center gap-2">
            <svg
              className="h-6 w-6"
              aria-label="Vercel logomark"
              height="64"
              role="img"
              viewBox="0 0 74 64"
              style={{ width: "auto", overflow: "visible" }}
            >
              <path
                d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
                fill="black"
              ></path>
            </svg>
            <GitHubLogoIcon className="h-7 w-7" />
          </div>
          <div className="sm:text-center space-y-3">
            <h1>
              <Balancer>Vercel Deploy Button Generator</Balancer>
            </h1>
            <p>
              <Balancer>
                Create a{" "}
                <a href="https://vercel.com?ref=deploy.bridger.to">Vercel</a>{" "}
                deploy button from a GitHub repository URL.
              </Balancer>
            </p>
          </div>
        </Craft>
        <Deploy />
        <p className="text-sm sm:text-center text-muted-foreground">
          Created by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
            href="https://bridger.to/x"
          >
            Bridger Tower
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
