'use client'
const AvailabilityPing = ({ available }: { available: boolean }) => {
  const color = available ? "bg-green-500" : "bg-yellow-500";

  return (
    <div className="relative flex items-center justify-center h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </div>
  );
};

export default AvailabilityPing;
