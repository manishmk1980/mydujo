import { useEffect, useState } from "react";

export default function PublicScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(percent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[1000] h-[3px] bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-[#0b101b]/95 dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.55)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
