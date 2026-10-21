import Image from "next/image";
import { IconButton } from "../Button/variants/IconButton";
import {
	CalendarDotsIcon,
	GearIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react/ssr";
import { Button } from "../Button";
import { HorizontalDayView } from "../../features/Calendar/parts/views/HorizontalDayView";

export default function HeaderMenu() {
	return (
		<header className="px-6 py-4 flex items-center justify-between gap-16">
			<section className="flex items-center gap-8">
				<Image
					src={"/calendar_logo.svg"}
					width={32}
					height={32}
					alt="Calendar logo"
				/>
				<IconButton label="Search">
					<MagnifyingGlassIcon className="text-sky-400" size={18} />
				</IconButton>
			</section>
			<nav className="flex items-center gap-8 h-14 max-w-250 w-full text-nowrap">
				<div className="flex items-center gap-4">
					<Button>See recipes</Button>
					<IconButton label="Search">
						<CalendarDotsIcon className="text-sky-400" size={18} />
					</IconButton>
				</div>
				<p>22 de Abril</p>
				<HorizontalDayView />
			</nav>
			<section className="flex">
				<IconButton label="Search">
					<GearIcon className="text-sky-400" size={18} />
				</IconButton>
			</section>
		</header>
	);
}
