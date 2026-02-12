import { Metadata } from "next";
import SettingsPage from "./page.client";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Settings() {
  return <SettingsPage />;
}
