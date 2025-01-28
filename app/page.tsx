import { Craft, Section, Container } from "@/components/craft";
import { Deploy } from "@/components/deploy";
import Balancer from "react-wrap-balancer";

export default function Home() {
  return (
    <Section>
      <Container>
        <Craft>
          <div className="sm:text-center space-y-2">
            <h1>Vercel Deploy Button Generator</h1>
            <p>
              Create a deploy button for your GitHub repository that works with
              Vercel.
            </p>
          </div>
          <Deploy />
        </Craft>
      </Container>
    </Section>
  );
}
