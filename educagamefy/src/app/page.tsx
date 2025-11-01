import { redirect } from 'next/navigation';

export default function RedirectToStudentDashboard() {
  redirect('/student/dashboard');

  return null; 
}
