'use client';

import { useState } from 'react';
import ModalLayout from './ModalLayout';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';

export default function AuthModal({ isOpen, onClose, initialType = 'register' }) {
  const [type, setType] = useState(initialType);

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    ('Submitted', formData);
  };

  const handleSwitch = (newType) => {
    setType(newType);
    setFormData({
      nome: '',
      cognome: '',
      email: '',
      password: '',
      confermaPassword: '',
    });
  };

  const handleForgot = () => {
    ('Forgot password clicked');
    // TODO
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[80wv] pb-2 lg:pb-6">
        <ModalHeader type={type} onClose={onClose} />
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          <ModalBody type={type} formData={formData} setFormData={setFormData} />
          <ModalFooter
            type={type}
            onSubmit={handleSubmit}
            onSwitch={handleSwitch}
            onForgot={handleForgot}
          />
        </form>
      </div>
    </ModalLayout>
  );
}
