import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Sword,
  X,
  RefreshCw,
  Upload
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';

export default function Registration() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support camera access.");
      return;
    }

    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let message = "Could not access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = "Camera access denied. Please allow camera permissions in your browser settings and ensure the app has permission in metadata.json.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = "No camera found on your device.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = "Camera is already in use by another application.";
      }
      alert(message);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      
      <main className="max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-4">
            <Sword className="size-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900">Join MyDojo</h1>
          <p className="text-slate-500 mt-2 text-lg">Begin your journey to mastery. Fill out the form below to register.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-2 bg-primary"></div>
          
          <form className="p-8 md:p-12 space-y-10">
            {/* Student Photo Section */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="size-40 rounded-full bg-slate-100 border-4 border-white shadow-2xl flex items-center justify-center text-slate-400 overflow-hidden relative group">
                  {photo ? (
                    <img src={photo} alt="Student Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="size-20" />
                  )}
                  
                  {photo && (
                    <button 
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <RefreshCw className="size-8" />
                    </button>
                  )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <button 
                    type="button" 
                    onClick={startCamera}
                    className="p-3 bg-primary text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                    title="Take Photo"
                  >
                    <Camera className="size-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-slate-800 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                    title="Upload Photo"
                  >
                    <Upload className="size-5" />
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">Student Profile Photo</p>
                <p className="text-xs text-slate-500 mt-1">Take a live photo or upload one from your device</p>
              </div>
            </div>

            {/* Camera Modal */}
            <AnimatePresence>
              {isCameraOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
                >
                  <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                    <button 
                      onClick={stopCamera}
                      className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                      <X className="size-6" />
                    </button>
                    
                    <div className="aspect-video bg-black flex items-center justify-center">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-8 flex items-center justify-center gap-6">
                      <button 
                        type="button"
                        onClick={capturePhoto}
                        className="size-20 bg-white rounded-full border-8 border-white/20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center"
                      >
                        <div className="size-12 bg-primary rounded-full"></div>
                      </button>
                    </div>
                    
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Personal Info */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
                <User className="text-primary size-5" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="John Doe" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" type="date"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Gender</label>
                  <select className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0">
                    <option>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Blood Group (Optional)</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="e.g. O+" type="text"/>
                </div>
              </div>
            </section>

            {/* Contact & Enrollment */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
                <Mail className="text-primary size-5" />
                Contact & Enrollment
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="john@example.com" type="email"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Phone Number</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="+1 (555) 000-0000" type="tel"/>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Emergency Contact (Name & Phone)</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="Jane Doe - +1 (555) 111-2222" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Preferred Discipline</label>
                  <select className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0">
                    <option>Select Discipline</option>
                    <option>Karate (Shotokan)</option>
                    <option>Judo (Kodokan)</option>
                    <option>Self Defense</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Training Center</label>
                  <select className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0">
                    <option>Select Location</option>
                    <option>Downtown Headquarters</option>
                    <option>Northside Satellite</option>
                    <option>Westbay Academy</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Terms */}
            <section className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-start gap-3">
                <input className="mt-1 text-primary focus:ring-primary h-4 w-4 rounded" type="checkbox" id="terms"/>
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                  I agree to the <Link className="text-primary font-bold underline" to="#">Terms of Service</Link> and understand the physical nature of martial arts training. I confirm that I am medically fit to participate.
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input className="mt-1 text-primary focus:ring-primary h-4 w-4 rounded" type="checkbox" id="marketing"/>
                <label htmlFor="marketing" className="text-sm text-slate-600 leading-relaxed">
                  I would like to receive updates about dojo events, seminars, and grading schedules via email.
                </label>
              </div>
            </section>

            <button className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
              Complete Registration <ArrowRight className="size-6" />
            </button>
          </form>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-slate-500">
            <Shield className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Enrollment</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Certified Instructors</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <Sword className="size-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Traditional Lineage</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
