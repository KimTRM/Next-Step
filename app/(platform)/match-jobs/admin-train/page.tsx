/**
 * Hidden Training Interface
 * Access: /match-jobs/admin-train
 * No links to this page from the UI — hidden by obscurity.
 */

import { TrainingDashboard } from "@/features/jobs/components/TrainingDashboard";

export const metadata = {
  title: "Model Training",
  robots: "noindex, nofollow",
};

export default function AdminTrainPage() {
  return <TrainingDashboard />;
}
