import PublicHero from "../../components/public/PublicHero";
import PublicFragmentedReality from "../../components/public/PublicFragmentedReality";
import PublicUnification from "../../components/public/PublicUnification";
import PublicFoundations from "../../components/public/PublicFoundations";
import PublicVideoGallery from "../../components/public/PublicVideoGallery";
import PublicWhoWeServe from "../../components/public/PublicWhoWeServe";
import PublicHarmonization from "../../components/public/PublicHarmonization";
import PublicTournamentPerformance from "../../components/public/PublicTournamentPerformance";
import PublicRoadmap from "../../components/public/PublicRoadmap";
import PublicManagementTeam from "../../components/public/PublicManagementTeam";
import PublicFoundingCTA from "../../components/public/PublicFoundingCTA";
import PublicLayout from "../../components/public/PublicLayout";

export default function HomePage() {
  return (
    <PublicLayout>
      <PublicHero />
      <PublicFragmentedReality />
      <PublicUnification />
      <PublicFoundations />
      <PublicVideoGallery />
      <PublicWhoWeServe />
      <PublicHarmonization />
      <PublicTournamentPerformance />
      <PublicRoadmap />
      <PublicManagementTeam />
      <PublicFoundingCTA />
    </PublicLayout>
  );
}
