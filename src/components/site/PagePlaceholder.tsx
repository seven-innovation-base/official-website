type PagePlaceholderProps = {
  title: string;
  description: string;
  phase: string;
};

/** 路由占位页：保证导航链接可达，具体功能在对应 Phase 实现。 */
export default function PagePlaceholder({ title, description, phase }: PagePlaceholderProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center">
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
      <p className="mt-5 text-slate-500">{description}</p>
      <p className="mt-10 inline-block rounded-full bg-mist px-5 py-2 text-xs font-medium tracking-widest text-slate-400">
        {phase}
      </p>
    </section>
  );
}
