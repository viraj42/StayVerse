import React from 'react';
import '../styles/Alert.css';

const Alert = ({ msg, shut }) => {

  if (!msg) return null;

  return (
    <div className="err-box">
      <div className="side-bar"></div>
      <div className="inner-flex">
        <span className="icon-thing">⚠️</span>
        
        <p className="txt">
          {msg}
        </p>
        <button className="c-btn" onClick={shut}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Alert;