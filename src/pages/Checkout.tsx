import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Shield,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      
      <main className="max-w-7xl mx-auto w-full px-6 py-12">
        <div className="mb-8">
          <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900">Secure Checkout</h1>
          <p className="text-slate-500 mt-1">Complete your payment for the upcoming training cycle.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-primary size-6" />
                Payment Method
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer">
                  <input defaultChecked className="absolute top-3 right-3 text-primary focus:ring-primary h-4 w-4" name="payment_method" type="radio"/>
                  <CreditCard className="size-8 mb-2 text-primary" />
                  <span className="text-sm font-bold">Card</span>
                </label>
                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
                  <input className="absolute top-3 right-3 text-primary focus:ring-primary h-4 w-4" name="payment_method" type="radio"/>
                  <Wallet className="size-8 mb-2 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">PayPal</span>
                </label>
                <label className="relative flex flex-col items-center justify-center p-4 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors">
                  <input className="absolute top-3 right-3 text-primary focus:ring-primary h-4 w-4" name="payment_method" type="radio"/>
                  <Building2 className="size-8 mb-2 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500">Transfer</span>
                </label>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Cardholder Name</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="Arjun Singh" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Card Number</label>
                  <div className="relative">
                    <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 pr-12" placeholder="0000 0000 0000 0000" type="text"/>
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Expiry Date</label>
                    <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="MM/YY" type="text"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">CVV</label>
                    <input className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0" placeholder="***" type="password"/>
                  </div>
                </div>
              </form>
            </section>

            <div className="flex items-center justify-center gap-8 py-4 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">PCI Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">SSL Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Norton Secured</span>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
              <h3 className="text-xl font-bold mb-6 relative z-10">Order Summary</h3>
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-900">Monthly Training Fee</p>
                    <p className="text-xs text-slate-500">November 2024 • Karate Advanced</p>
                  </div>
                  <span className="font-bold">₹4,500.00</span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-900">Grading Eligibility Fee</p>
                    <p className="text-xs text-slate-500">Belt Assessment (Blue Belt)</p>
                  </div>
                  <span className="font-bold">₹1,500.00</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="text-slate-500 text-sm">Processing Fee</span>
                  <span className="text-slate-900 text-sm font-medium">₹150.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Sales Tax (5%)</span>
                  <span className="text-slate-900 text-sm font-medium">₹300.00</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 mb-8 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Total Amount</p>
                    <p className="text-4xl font-black text-slate-900">₹6,450.00</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mb-1">INR</span>
                </div>
              </div>
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 relative z-10">
                <CheckCircle2 className="size-6" />
                Pay Now
              </button>
              <p className="text-[10px] text-center mt-6 text-slate-400 leading-relaxed">
                By clicking 'Pay Now' you agree to the MyDojo <Link className="underline" to="#">Membership Terms</Link> and auto-renewal policy.
              </p>
            </div>
            <div className="mt-6 p-6 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <Gift className="text-orange-400 size-6" />
                <div>
                  <p className="text-xs font-bold text-slate-400">Next Grade Ready</p>
                  <p className="text-sm font-bold">Grading eligibility after this payment!</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
