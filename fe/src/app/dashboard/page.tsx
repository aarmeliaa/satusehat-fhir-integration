import { redirect } from 'next/navigation';

/**
 * /dashboard redirects to /dashboard/patient as the default module.
 */
export default function DashboardIndexPage() {
  redirect('/dashboard/patient');
}
