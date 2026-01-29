import { redirect } from 'next/navigation';

export default function RootPage() {
  // This will redirect to the main app which handles auth
  redirect('/home');
}
