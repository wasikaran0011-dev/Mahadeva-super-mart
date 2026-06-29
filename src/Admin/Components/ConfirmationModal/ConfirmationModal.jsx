import { FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false }) => {
  if (!isOpen) return null;

  return (
    <div className="conf-modal-overlay" onClick={onCancel}>
      <div className="conf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="conf-modal-header">
          {isDestructive && <FaExclamationTriangle className="warning-icon" />}
          <h2>{title}</h2>
        </div>
        <div className="conf-modal-body">
          <p>{message}</p>
        </div>
        <div className="conf-modal-footer">
          <button className="conf-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`conf-btn-confirm ${isDestructive ? 'destructive' : 'primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
