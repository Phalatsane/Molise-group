import React from 'react';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)', padding: '20px 0', textAlign: 'center' }}>
      <small>&copy; {year} Career Guidance Platform. All rights reserved.</small>
    </footer>
  );
}

export default Footer;

