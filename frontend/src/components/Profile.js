import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Робимо запит на сервер для отримання профілю користувача
    fetch('/api/profile', {
      method: 'GET',
      credentials: 'include', // Для передачі куки
    })
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error('Error fetching profile:', error));
  }, []);

  return (
    <div>
      <h2>Profile Page</h2>
      {user ? (
        <>
          <p>Welcome, {user.username}!</p>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;