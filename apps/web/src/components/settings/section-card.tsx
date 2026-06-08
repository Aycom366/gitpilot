interface SectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-6'>
      <div className='mb-5'>
        <h2 className='text-base font-semibold text-white'>{title}</h2>
        <p className='text-sm text-zinc-500 mt-0.5'>{description}</p>
      </div>
      {children}
    </div>
  );
}
