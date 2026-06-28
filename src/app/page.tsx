import Navbar from "@/components/Navbar";
import CinematicHero from "@/components/CinematicHero";
import About from "@/components/About";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Stack from "@/components/Stack";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Navbar />
      <CinematicHero />
      <About />
      <Services />
      <Work />
      <Stack />
      <Process />
      <Contact />
      <Footer />
    </>
  );
}
