import { useState, type ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon: ReactNode;
  iconOpen: ReactNode;
}

export default function AccordionSection({
  title,
  children,
  defaultOpen = false,
  icon,
  iconOpen,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[#ededed] pt-4">
      <button className="flex justify-between items-center w-full text-left" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-base font-medium text-[#333333]">{title}</h3>
        <span>{isOpen ? iconOpen : icon}</span>
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}
