import type {
	AriaAttributes,
	InputHTMLAttributes,
	LabelHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

type RequiredFieldProps = Pick<
	InputHTMLAttributes<HTMLInputElement>,
	'required' | keyof AriaAttributes
>;

function requiredFieldProps(isRequired = true): RequiredFieldProps {
	return isRequired
		? { 'aria-required': true, required: true }
		: {};
}

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
	required?: boolean;
};

function Label({
	children,
	className,
	required = false,
	...props
}: LabelProps) {
	return (
		<label
			className={cn(
				'text-sm leading-none font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
				className,
			)}
			{...props}
		>
			{children}
			{required ? (
				<>
					<span aria-hidden="true" className="ml-0.5 text-destructive">
						*
					</span>
					<span className="sr-only"> (obrigatório)</span>
				</>
			) : null}
		</label>
	);
}

export { Label, requiredFieldProps };
export type { RequiredFieldProps };
