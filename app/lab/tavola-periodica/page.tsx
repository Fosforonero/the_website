import type { Metadata } from "next";
import { PeriodicTableView } from "@/components/lab/periodic-table-view";
import "@/components/lab/periodic-table.css";

export const metadata: Metadata = {
  title: "Tavola Periodica Interattiva — Lab",
  description:
    "Esplora tutti i 118 elementi con visualizzazione 3D dell'atomo in WebGL: modello di Bohr con elettroni animati, glow e trail.",
  robots: { index: true, follow: true },
};

export default function TavolaPeriodica() {
  return <PeriodicTableView />;
}
