'use client';

export default function ToggleSwitch({ isOn, handleToggle, label }) {
  return (
    <div className="flex items-center gap-1 md:gap-2 bg-indigo-950/30 px-2 md:px-3 py-1 md:py-2 rounded-md border border-indigo-900/30">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isOn}
          onChange={handleToggle}
        />
        <div className="w-8 md:w-11 h-4 md:h-6 bg-gray-700 rounded-full peer
                      peer-focus:ring-2 peer-focus:ring-purple-600/50
                      peer-checked:after:translate-x-full after:content-['']
                      after:absolute after:top-[2px] after:left-[2px]
                      after:bg-white after:rounded-full after:h-3 md:after:h-5 after:w-3 md:after:w-5
                      after:transition-all peer-checked:bg-purple-600
                      after:shadow-sm hover:after:shadow-purple-500/20"></div>
      </label>
      <span className="text-xs md:text-sm font-medium text-white/90">{label}</span>
    </div>
  );
}
