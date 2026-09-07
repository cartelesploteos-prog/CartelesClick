import React from 'react';
import { motion } from 'motion/react';

interface OrderProgressBarProps {
  status: string;
}

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status }) => {
  // Mapping statuses to index
  const steps = ['Pendiente', 'Diseño', 'Impresión', 'Acabado', 'Listo para retiro'];
  
  // Logic to determine active index
  let stepIndex = 0;
  if (status === 'en_produccion') stepIndex = 2;
  else if (status === 'terminaciones') stepIndex = 3;
  else if (status === 'despachado' || status === 'entregado') stepIndex = 4;
  else if (status === 'pendiente') stepIndex = 1;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
        {steps.map((s, i) => (
          <span key={s} className={i <= stepIndex ? "text-primary font-bold" : ""}>{s}</span>
        ))}
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-[var(--brand-brick)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
};
