import React from 'react';
import './Welcome.css';

interface WelcomeProps {
  onClose: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onClose }) => {
  return (
    <div className="welcome-overlay">
      <div className="welcome-popup">
        <div className="welcome-header">
          <h2>لك اي مو اهلين وسهلين فيك نورت حبيبي</h2>
          <span role="img" aria-label="waving hand" className="welcome-icon">
            👋
          </span>
        </div>
        <p>جديد جديد النسخة الجديدة من موقعنا المميز</p>
        <p> مع تحيات المبرمج المشهور هااااااني الزييير</p>
        <button onClick={onClose} className="welcome-button">
          كبوس هون وبلش طلبيتك معنا
        </button>
      </div>
    </div>
  );
};

export default Welcome;