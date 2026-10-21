import { ButtonBase, ButtonBaseProps } from "../../ButtonBase";

export function IconButton({
	label,
	children,
	className,
	...props
}: ButtonBaseProps & { label: string }) {
	return (
		<ButtonBase
			aria-label={label}
			className={`min-w-9 min-h-9 rounded-full border border-light-teal hover:bg-sky-200/25 shadow-lg border-sky-300/50 shadow-sky-300/25 transition-all ease-in-out duration-200 cursor-pointer flex items-center justify-center ${className}`}
			{...props}
		>
			{children}
		</ButtonBase>
	);
}
