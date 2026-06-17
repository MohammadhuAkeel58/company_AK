import CinematicHero from "@/components/CinematicHero";
import WhoWeAre from "@/components/WhoWeAre";
import ServicesSection from "@/components/ServicesSection";
import SeamFades from "@/components/SeamFades";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <CinematicHero />
      <WhoWeAre />
      <ServicesSection />
      <SeamFades />
    </>
  );
}
