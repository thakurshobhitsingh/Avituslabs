import { useEffect, useState } from "react";

export function useResponsiveSize() {
  const [size, setSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;

      if (width >= 1520) { // 2xl
        setSize({ width: 1000, height: 400 });
      } else if (width >= 1280) { // xl
        setSize({ width: 850, height: 400 });
      } else if (width >= 768) { // md
        setSize({ width: 900, height: 400 });
      } else {
        setSize({ width: 560, height: 400 }); // mobile
      }
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
