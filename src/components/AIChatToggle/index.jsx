import React, { useState } from 'react';
import { RobotOutlined } from '@ant-design/icons';
import AIChatInterface from '../AIChatInterface';
import '../AIChatInterface/index.css';

function AIChatToggle() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isOpen && <AIChatInterface onClose={() => setIsOpen(false)} />}
      {!isOpen && (
        <button 
          className="ai-chat-toggle"
          onClick={handleToggle}
          aria-label="打开 AI 助手"
        >
          <RobotOutlined className="ai-chat-toggle-icon" />
        </button>
      )}
    </>
  );
}

export default AIChatToggle;
