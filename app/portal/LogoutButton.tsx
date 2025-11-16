'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/portal/api/logout', {
        method: 'POST',
      });
      router.push('/portal/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      Logout
    </button>
  );
}
