import { DoorOpenIcon, GearIcon } from "@phosphor-icons/react/ssr";
import { IconButton } from "../Button/variants/IconButton";

export function NavSidebar() {
	return (
		<nav className="flex flex-col items-center justify-between gap-4 p-5">
			<div className="flex flex-col gap-2 grow justify-center">
				<IconButton label="Search">
					<GearIcon className="text-sky-400" size={18} />
				</IconButton>
				<IconButton label="Search">
					<GearIcon className="text-sky-400" size={18} />
				</IconButton>
				<IconButton label="Search">
					<GearIcon className="text-sky-400" size={18} />
				</IconButton>
				<IconButton label="Search">
					<GearIcon className="text-sky-400" size={18} />
				</IconButton>
			</div>
			<IconButton label="Search">
				<DoorOpenIcon className="text-sky-400" size={18} />
			</IconButton>
		</nav>
	);
}
