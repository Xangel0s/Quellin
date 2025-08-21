import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../services/firebase';
import { useUI } from '../contexts/UIContext';

const steps = [
  'nombre',
  'bio_rol',
  'preview',
  'verificacion',
];

const roleOptions = [
  { value: 'estudiante', label: '🎓 Estudiante' },
  { value: 'profesor', label: '👨‍🏫 Profesor' },
  { value: 'coach', label: '🧑‍💼 Coach' },
  { value: 'autodidacta', label: '🤓 Autodidacta' },
];

const OnboardingWizard: React.FC = () => {
  const { currentUser, setError } = useAuth();
  const { addToast } = useUI();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('estudiante');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const [animatingNext, setAnimatingNext] = useState(false);

  const handleNext = async () => {
    // Small animation before changing step
    setAnimatingNext(true);
    await new Promise(res => setTimeout(res, 220));
    setAnimatingNext(false);

    if (step === 1) {
      setLoading(true);
      try {
        const { set, ref } = await import('firebase/database');
        const profile = {
          name: `${name} ${surname}`.trim(),
          bio,
          role,
          avatar: {
            color: 'bg-slate-500',
            initials: name.charAt(0).toUpperCase(),
          },
          plan: 'free',
          certificate_uses_left: 1,
        };
        await set(ref(db, `profiles/${currentUser.id}`), profile);
        setProfileCreated(true);
        // After creating profile, send verification email with actionCodeSettings
        try {
          const { sendEmailVerification } = await import('firebase/auth');
          const actionCodeSettings = {
            url: window.location.origin + window.location.pathname,
            handleCodeInApp: false,
          } as any;
          if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser, actionCodeSettings);
            addToast('Correo de verificación enviado. Revisa tu bandeja (y spam).', 'success');
          } else {
            addToast('No se pudo enviar el correo: usuario no autenticado.', 'error');
          }
        } catch (err: any) {
          addToast('No se pudo enviar el correo de verificación: ' + (err?.message || ''), 'error');
        }
      } catch (err: any) {
        setError('Error al guardar el perfil.');
      }
      setLoading(false);
    }
    setStep(step + 1);
  };

  const handleResend = async () => {
    if (showResend) return; // cooldown
    setLoading(true);
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      const actionCodeSettings = {
        url: window.location.origin + window.location.pathname,
        handleCodeInApp: false,
      } as any;
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
        setShowResend(true);
        addToast('Correo reenviado. Revisa tu bandeja (y spam).', 'success');
        setTimeout(() => setShowResend(false), 30000);
      } else {
        addToast('No se pudo reenviar: usuario no autenticado.', 'error');
      }
    } catch (err: any) {
      setError('No se pudo reenviar el correo: ' + (err?.message || ''));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
    {step === 0 && (
          <>
      <h2 className="text-2xl font-bold mb-4 text-teal-700">¿Cómo te llamas?</h2>
            <div className="flex gap-3 mb-6">
              <input
                name="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre"
                className="w-1/2 px-4 py-3 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 transition-all duration-300 shadow-sm"
                required
                maxLength={20}
              />
              <input
                name="surname"
                type="text"
                value={surname}
                onChange={e => setSurname(e.target.value)}
                placeholder="Apellido"
                className="w-1/2 px-4 py-3 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 transition-all duration-300 shadow-sm"
                required
                maxLength={20}
              />
            </div>
            <button type="button" className={`w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-transform duration-200 ${animatingNext ? 'scale-95 opacity-70' : ''}`} onClick={handleNext} disabled={!name || !surname}>
              Siguiente
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-teal-700">¿A qué te dedicas?</h2>
            <textarea
              name="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Cuéntanos algo sobre ti..."
              className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl text-base focus:border-teal-500 transition-all duration-300 shadow-sm mb-4"
              rows={3}
              maxLength={120}
            />
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-sm font-semibold text-slate-700 mb-1">¿Cuál es tu rol principal?</label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map(opt => (
                  <button type="button" key={opt.value} onClick={() => setRole(opt.value)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-sm text-base font-medium ${role===opt.value ? 'border-teal-500 bg-teal-50 scale-105' : 'border-slate-200 bg-white'}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <button type="button" className={`w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-transform duration-200 ${animatingNext ? 'scale-95 opacity-70' : ''}`} onClick={handleNext} disabled={loading || !bio}>
              Siguiente
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-teal-700">Vista previa de tu perfil</h2>
            <div className="flex flex-col items-center gap-3 mb-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
              <p className="text-lg font-semibold text-slate-800">{name} {surname}</p>
              <span className="text-base text-teal-700 font-medium">{roleOptions.find(r => r.value === role)?.label}</span>
              <p className="text-slate-600 text-center">{bio}</p>
            </div>
            <button type="button" className={`w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-transform duration-200 ${animatingNext ? 'scale-95 opacity-70' : ''}`} onClick={handleNext}>
              Crear usuario
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-teal-700">¡Revisa tu correo!</h2>
            <div className="flex flex-col items-center gap-2 mb-4 animate-fadeIn">
              <p className="text-base text-slate-700 text-center">Para activar tu cuenta, verifica tu correo electrónico:</p>
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 mt-2">
                <span className="font-semibold text-teal-700">{currentUser.email}</span>
                <a href={`https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent(currentUser.email)}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-teal-600 underline transform transition-transform duration-200 hover:scale-105">Abrir Gmail</a>
              </div>
              <button type="button" className={`mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold shadow hover:bg-teal-700 transition-transform duration-200 ${showResend ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={handleResend} disabled={loading || showResend}>
                {showResend ? 'Reenviado ✔' : 'Reenviar correo de verificación'}
              </button>
              {showResend && <span className="text-green-600 text-sm mt-2 animate-pulse">Correo reenviado ✔</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
