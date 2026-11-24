import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <>
      <h1>Site settings</h1>
      <SettingsForm s={s} />
    </>
  );
}
