import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "暗号通貨取引所ガイド",
    short_name: "取引所ガイド",
    description: "国内・海外の仮想通貨取引所を比較・検索できるサービス",
    start_url: "/",
    display: "standalone",
    background_color: "#D9E8F4",
    theme_color: "#1E3A8A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
