import PublicLayout from "../../components/public/PublicLayout";
import PublicAcademyHero from "../../components/public/academy/PublicAcademyHero";
import PublicAcademyBenefits from "../../components/public/academy/PublicAcademyBenefits";
import PublicAcademyOnboarding from "../../components/public/academy/PublicAcademyOnboarding";
import PublicAcademyVisibility from "../../components/public/academy/PublicAcademyVisibility";
import PublicAcademyCTA from "../../components/public/academy/PublicAcademyCTA";

export default function AcademyPage() {
  return (
    <PublicLayout>
      <PublicAcademyHero />
      <PublicAcademyBenefits />
      <PublicAcademyOnboarding />
      <PublicAcademyVisibility />
      <PublicAcademyCTA />
    </PublicLayout>
  );
}
