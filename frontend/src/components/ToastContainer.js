import React, { useEffect, useState } from 'react';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { message, type } = e.detail || {};
      const id = Date.now();
      setToasts(t => [...t, { id, message, type }]);
      // remove after 4s
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
    };
    window.addEventListener('showToast', handler);
    return () => window.removeEventListener('showToast', handler);
  }, []);

  return (
    <div style={{position:'fixed', top:12, right:12, zIndex:9999}}>
      {toasts.map(t => (
        <div key={t.id} style={{marginBottom:8, padding:'10px 14px', background: t.type === 'error' ? '#fdecea' : '#e6ffed', border: '1px solid #ddd', borderRadius:6}}>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
