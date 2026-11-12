export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: '#00e6b0',
            borderRightColor: 'rgba(0,230,176,0.2)',
          }}
        />
        <p className="text-xs font-mono text-slate-600">
          Loading Kaira…
        </p>
      </div>
    </div>
  );
}
