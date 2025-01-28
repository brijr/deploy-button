import { Craft, Section, Container, Prose } from "@/components/craft";
import { Deploy } from "@/components/deploy";
import Balancer from "react-wrap-balancer";

import { GitHubLogoIcon, VercelLogoIcon } from "@radix-ui/react-icons";

export default function Home() {
  return (
    <Section>
      <Container className="space-y-12">
        <Craft className="space-y-6 sm:space-y-12">
          <div className="flex items-center justify-center gap-2">
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
            <GitHubLogoIcon className="h-6 w-6" />
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
        <Prose>
          <Deploy />
        </Prose>
      </Container>
    </Section>
  );
}
