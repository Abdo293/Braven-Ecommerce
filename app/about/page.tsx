import { AboutPage } from "@/components/about/About";
import { PagesHeader } from "@/components/PagesHeader";

function About() {
  return (
    <div>
      <div className="bg-[#f0f0f0]">
        <div className="container mx-auto max-md:px-3">
          <PagesHeader routes="about" title="About Us" />
        </div>
      </div>
      <AboutPage />
    </div>
  );
}

export default About;
