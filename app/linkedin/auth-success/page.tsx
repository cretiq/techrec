import { redirect } from 'next/navigation';

export default function LinkedInAuthSuccess() {
  // Redirect to the jobs page after a short delay
  redirect('/linkedin/jobs');
} 