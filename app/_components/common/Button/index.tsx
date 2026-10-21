import { ButtonBase, ButtonBaseProps } from "./ButtonBase";

export function Button({ children, ...props }: ButtonBaseProps) {
	return (
		<ButtonBase
			className="
                h-10 px-4 text-sm font-regular rounded-full border border-sky-300/50 
            hover:bg-sky-200/25 shadow-lg shadow-sky-300/15 text-sky-600
                transition-all ease-in-out text-nowrap
                duration-200 cursor-pointer flex items-center justify-center"
			{...props}
		>
			{children}
		</ButtonBase>
	);
}
