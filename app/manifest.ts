import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Julien C — DJ Événementiel",
    short_name: "Julien C",
    description:
      "DJ Julien C, spécialiste des soirées événementielles : mariages, anniversaires, soirées privées.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#3b2fb5",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
