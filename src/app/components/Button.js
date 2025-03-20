'use client';

export default function Button({ onClick, text, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-2 px-5 m-1 rounded-xl transition-all duration-300 text-sm md:text-base relative overflow-hidden
        ${
        disabled
          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed opacity-70'
          : className || `glass bg-gradient-to-r from-violet-600 to-purple-600 text-white
                        hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/40
                        active:translate-y-[1px] active:shadow-none
                        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
                        after:absolute after:inset-0 after:opacity-0 after:bg-white/20
                        after:transition-opacity hover:after:opacity-100`
      }`}
    >
      <span className="relative z-10">{text}</span>
    </button>
  );
}
