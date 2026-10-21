import { CoffeeIcon, MoonIcon, PintGlassIcon } from "@phosphor-icons/react/ssr";

export function HorizontalDayView() {
	return (
		<section className="w-full h-12 bg-sky-100/50 shadow-lg shadow-sky-300/25 rounded-full flex items-center gap-5 py-1.5 ps-4 scrollbar-none overflow-y-hidden overflow-x-auto">
			<div className="flex items-center gap-4 h-full ">
				<h1 className="text-[10px] tracking-wide">10:00 AM</h1>

				<div className="bg-sky-200/25 rounded-full py-1 ps-1 pe-3 w-full h-full flex items-center gap-2">
					<div className="h-full aspect-square bg-blue-800/10 rounded-full flex items-center justify-center">
						<CoffeeIcon />
					</div>
					<p className="text-sm font-light">
						Toast de banana com canela
					</p>
				</div>
			</div>

			<div className="min-w-px h-6 bg-linear-0 from-sky-100 via-sky-600/25 to-sky-100"></div>

			<div className="flex items-center gap-4 h-full ">
				<h1 className="text-[10px] tracking-wide">12:00 AM</h1>
				<div className="bg-blue-200/25 rounded-full py-1 ps-1 pe-3 w-full h-full flex items-center gap-2">
					<div className="h-full aspect-square bg-blue-800/10 rounded-full flex items-center justify-center">
						<PintGlassIcon />
					</div>
					<p className="text-sm font-light">PF Tradicional</p>
				</div>
			</div>

			<div className="min-w-px h-6 bg-linear-0 from-sky-100 via-sky-600/25 to-sky-100"></div>

			<div className="flex items-center gap-4 h-full ">
				<h1 className="text-[10px] tracking-wide">15:00 PM</h1>

				<div className="bg-amber-200/25 rounded-full py-1 ps-1 pe-3 w-full h-full flex items-center gap-2">
					<div className="h-full aspect-square bg-amber-800/10 rounded-full flex items-center justify-center">
						<CoffeeIcon />
					</div>
					<p className="text-sm font-light">Overnight Oats</p>
				</div>
			</div>

			<div className="min-w-px h-6 bg-linear-0 from-sky-100 via-sky-600/25 to-sky-100"></div>

			<div className="flex items-center gap-4 h-full ">
				<h1 className="text-[10px] tracking-wide">10:00 AM</h1>
				<div className="bg-sky-200/25 rounded-full py-1 ps-1 pe-3 w-full h-full flex items-center gap-2">
					<div className="h-full aspect-square bg-blue-800/10 rounded-full flex items-center justify-center">
						<CoffeeIcon />
					</div>
					<p className="text-sm font-light">
						Toast de banana com canela
					</p>
				</div>
			</div>

			<div className="min-w-px h-6 bg-linear-0 from-sky-100 via-sky-600/25 to-sky-100"></div>

			<div className="flex items-center gap-4 h-full ">
				<h1 className="text-[10px] tracking-wide">10:00 AM</h1>
				<div className="bg-amber-200/25 rounded-full py-1 ps-1 pe-3 w-full h-full flex items-center gap-2">
					<div className="h-full aspect-square bg-amber-800/10 rounded-full flex items-center justify-center">
						<MoonIcon />
					</div>
					<p className="text-sm font-light">Hamburger</p>
				</div>
			</div>
		</section>
	);
}
