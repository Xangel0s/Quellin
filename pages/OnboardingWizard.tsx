import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../services/firebase';

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
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('estudiante');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);

  // On mount check if a profile already exists for this user. If it does and
  // the email is already verified, there's no need to show the wizard again
  // (prevents duplicate profile creation when user opens the verification link).
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUser || !currentUser.id) return;
      try {
        const { get, ref } = await import('firebase/database');
        const snap = await get(ref(db, `profiles/${currentUser.id}`));
        if (!mounted) return;
        if (snap && snap.exists()) {
          setProfileCreated(true);
          // If already verified, close onboarding and return to the app
          if (currentUser.emailVerified) {
            window.location.hash = '';
          } else {
            // If profile exists but user is not verified, show the verification step
            setStep(3);
          }
        }
      } catch (err) {
        // ignore errors here; the normal flow will allow creating the profile
      }
    })();
    return () => { mounted = false; };
  }, [currentUser]);

  const handleNext = async () => {
    if (step === 1) {
      setLoading(true);
      try {
        const { get, set, ref } = await import('firebase/database');
        const profileRef = ref(db, `profiles/${currentUser.id}`);
        const existing = await get(profileRef);
        if (!existing || !existing.exists()) {
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
          await set(profileRef, profile);
          setProfileCreated(true);
        } else {
          // Profile already exists: mark created and continue
          setProfileCreated(true);
        }
      } catch (err: any) {
        setError('Error al guardar el perfil.');
      }
      setLoading(false);
    }
    // Si estamos en el paso final (preview -> crear usuario), enviar correo y redirigir
    if (step === 2) {
      // Intentar enviar el correo de verificación inmediatamente si hay usuario autenticado
      try {
        const { sendEmailVerification } = await import('firebase/auth');
        if (auth.currentUser) {
          const canonicalUrl = (import.meta as any).env.MODE === 'production' ? 'https://quellin.netlify.app' : window.location.origin + window.location.pathname;
          const actionCodeSettings = { url: canonicalUrl, handleCodeInApp: false };
          await sendEmailVerification(auth.currentUser, actionCodeSettings);
        }
      } catch (e) {
        // no bloqueante: el App mostrará la UI de verificación y permitirá reintentos
      }
      // Redirigir fuera del wizard para usar la página de verificación antigua gestionada por App
      window.location.hash = '';
      return;
    }

    setStep(step + 1);
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { sendEmailVerification } = await import('firebase/auth');
      // Esperar un poco a que auth.currentUser esté disponible
      const start = Date.now();
      while (!auth.currentUser && Date.now() - start < 3000) {
        // small wait
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 200));
      }
      if (!auth.currentUser) {
        setError('No se pudo reenviar: usuario no autenticado.');
        setLoading(false);
        return;
      }

  const canonicalUrl = (import.meta as any).env.MODE === 'production' ? 'https://quellin.netlify.app' : window.location.origin + window.location.pathname;
  const actionCodeSettings = { url: canonicalUrl, handleCodeInApp: false };
      // Forzar refresh del idToken para evitar INVALID_ID_TOKEN
      try {
        // eslint-disable-next-line no-await-in-loop
        await auth.currentUser.getIdToken(true);
      } catch (tokErr: any) {
        // No bloqueante, pero lo registramos
        // eslint-disable-next-line no-console
        console.warn('getIdToken failed before sendEmailVerification:', tokErr);
      }

      try {
        await sendEmailVerification(auth.currentUser, actionCodeSettings);
      } catch (sendErr: any) {
        // Mostrar mensaje detallado para diagnóstico
        const msg = (sendErr && (sendErr.code || sendErr.message)) ? (sendErr.code || sendErr.message) : String(sendErr);
        setError('No se pudo reenviar el correo: ' + msg);
        // eslint-disable-next-line no-console
        console.error('sendEmailVerification error:', sendErr);
        setLoading(false);
        return;
      }
      setShowResend(true);
      setTimeout(() => setShowResend(false), 3000);
    } catch {
      setError('No se pudo reenviar el correo.');
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
            <button type="button" className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-all duration-300" onClick={handleNext} disabled={!name || !surname}>
              Siguiente
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-teal-700">Personaliza tu perfil</h2>
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
            <button type="button" className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-all duration-300" onClick={handleNext} disabled={loading || !bio}>
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
            <button type="button" className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 transition-all duration-300" onClick={handleNext}>
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
                <a href={`https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent(currentUser.email)}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-teal-600 underline">Abrir Gmail</a>
              </div>
              <button type="button" className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold shadow hover:bg-teal-700 transition-all duration-300" onClick={handleResend} disabled={loading}>
                Reenviar correo de verificación
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
