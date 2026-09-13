import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarCheck2, CheckCircle2, FolderKanban, GraduationCap, ShieldCheck, Users2 } from 'lucide-react';

const features = [
  { icon: FolderKanban, title: 'Project lifecycle', text: 'Move from proposal to final review with one source of truth for every milestone.' },
  { icon: Users2, title: 'Guided collaboration', text: 'Connect student teams, faculty mentors, reviewers, and coordinators in one workspace.' },
  { icon: CalendarCheck2, title: 'Academic rhythm', text: 'Keep reviews, meetings, submissions, and sign-offs aligned to the semester calendar.' },
  { icon: BarChart3, title: 'Decision-ready insights', text: 'See progress, workload, outcomes, and risk signals across departments.' },
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f5ef] text-[#1e241b]">
      <header className="border-b border-[#dedfd3] bg-[#f6f5ef]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-oJlDlNnt39RNNRPj7s3u0LMytyTpuh.png" alt="SRM University AP" className="size-12 object-contain" />
            <div><p className="font-serif text-lg font-semibold tracking-tight">SRM University-AP</p><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#707661]">Academic project portal</p></div>
          </div>
          <button onClick={() => navigate('/login')} className="rounded-full bg-[#29321e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3f4c2e] sm:px-5">Sign in <ArrowRight className="ml-1 inline size-4" /></button>
        </div>
      </header>
      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-24">
          <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d5d8c5] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#69714e]"><ShieldCheck className="size-4" /> Built for SRM University-AP</div><h1 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-[#29321e] sm:text-6xl lg:text-7xl">Make every academic project <span className="text-[#8c7925]">matter.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-[#68705e] sm:text-lg">A calmer, clearer way to manage proposals, teams, mentorship, reviews, and outcomes across the university.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={() => navigate('/login')} className="rounded-full bg-[#29321e] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#29321e]/15 transition hover:-translate-y-0.5 hover:bg-[#3f4c2e]">Enter project portal <ArrowRight className="ml-2 inline size-4" /></button><a href="#capabilities" className="rounded-full border border-[#cfd2c0] bg-white/50 px-6 py-3.5 text-center text-sm font-semibold text-[#4d5740] transition hover:bg-white">Explore capabilities</a></div></div>
          <div className="relative mx-auto w-full max-w-[520px]"><div className="absolute -inset-8 rounded-full bg-[#c8cf9a]/25 blur-3xl" /><div className="relative rounded-[2rem] border border-[#d7d9c7] bg-[#e9eadc] p-5 shadow-2xl shadow-[#475032]/10 sm:p-8"><div className="rounded-[1.35rem] border border-white/70 bg-[#f8f8f1] p-5 sm:p-7"><div className="flex items-center justify-between border-b border-[#e1e2d7] pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c7925]">Semester 06</p><p className="mt-1 font-serif text-2xl text-[#29321e]">Project overview</p></div><div className="flex -space-x-2"><span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#b9c68e] text-xs font-bold">AK</span><span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#d9c47d] text-xs font-bold">RM</span><span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#c6d0c4] text-xs font-bold">+4</span></div></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#edf0df] p-4"><p className="text-3xl font-semibold text-[#29321e]">12</p><p className="mt-1 text-xs text-[#69714e]">Active projects</p></div><div className="rounded-xl bg-[#f3ecce] p-4"><p className="text-3xl font-semibold text-[#8c7925]">86%</p><p className="mt-1 text-xs text-[#82733a]">On track</p></div></div><div className="mt-5 rounded-xl border border-[#e1e2d7] bg-white p-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#29321e]">Smart campus mobility</p><span className="rounded-full bg-[#e4eedb] px-2 py-1 text-[10px] font-bold text-[#597143]">On track</span></div><div className="mt-4 h-2 rounded-full bg-[#e8e9df]"><div className="h-2 w-[72%] rounded-full bg-[#81965c]" /></div><div className="mt-3 flex justify-between text-[11px] text-[#7d8473]"><span>Research & validation</span><span>72%</span></div></div></div></div></div>
        </section>
        <section id="capabilities" className="border-y border-[#dedfd3] bg-white/55"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-14 sm:px-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-[#e0e1d6] bg-[#fafaf5] p-5"><Icon className="size-5 text-[#8c7925]" /><h2 className="mt-6 font-serif text-xl text-[#29321e]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#717868]">{text}</p></article>)}</div></section>
        <section className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-16 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c7925]">One connected campus</p><h2 className="mt-3 max-w-2xl font-serif text-3xl tracking-tight text-[#29321e] sm:text-4xl">Less admin friction. More meaningful project work.</h2></div><div className="flex items-center gap-3 text-sm text-[#68705e]"><CheckCircle2 className="size-5 text-[#81965c]" /> Secure university access <GraduationCap className="ml-4 size-5 text-[#8c7925]" /> Designed for every role</div></section>
      </main>
    </div>
  );
};
export default Landing;
