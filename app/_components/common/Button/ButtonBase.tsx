import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type ButtonBaseProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(
	(
		{ className, children, ...props },
		ref: ForwardedRef<HTMLButtonElement>,
	) => {
		return (
			<button ref={ref} className={className} {...props}>
				{children}
			</button>
		);
	},
);

ButtonBase.displayName = "ButtonBase";
