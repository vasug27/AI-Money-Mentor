export default function PageHero({ title, subtitle, image }) {
  return (
    <div className="relative w-full h-56 md:h-64 overflow-hidden">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/20 flex flex-col justify-center px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-white/80 text-base md:text-lg max-w-xl">{subtitle}</p>
      </div>
    </div>
  )
}